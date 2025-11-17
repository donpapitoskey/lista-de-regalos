'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Plus, ExternalLink, Package } from 'lucide-react';
import { Regalo, Persona } from '@/types';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Dropdown, { DropdownItem } from '@/components/Dropdown';
import { useSocket } from '@/lib/socket';

export default function RegalosPage() {
  const router = useRouter();
  const params = useParams();
  const personaId = params.personaId as string;
  const { socket } = useSocket();

  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRegalo, setSelectedRegalo] = useState<Regalo | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    url: '',
    url_imagen: '',
    lugarCompra: '',
  });
  const [errors, setErrors] = useState({ nombre: '' });

  const fetchPersona = useCallback(async () => {
    try {
      const response = await fetch(`/api/personas/${personaId}`);
      if (response.ok) {
        const data = await response.json();
        setPersona(data);
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Error al cargar persona:', err);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [personaId, router]);

  useEffect(() => {
    fetchPersona();

    // Escuchar eventos de WebSocket
    if (socket) {
      socket.on('regalo:updated', (data: { personaId: number }) => {
        if (data.personaId === parseInt(personaId)) {
          fetchPersona();
        }
      });

      socket.on('regalo:deleted', (data: { personaId: number }) => {
        if (data.personaId === parseInt(personaId)) {
          fetchPersona();
        }
      });

      return () => {
        socket.off('regalo:updated');
        socket.off('regalo:deleted');
      };
    }
  }, [fetchPersona, socket, personaId]);

  const fetchMetadata = async (url: string) => {
    if (!url.trim()) return;

    setLoadingMetadata(true);
    try {
      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url_imagen) {
          setFormData((prev) => ({ ...prev, url_imagen: data.url_imagen }));
        }
      }
    } catch (err) {
      console.error('Error al obtener metadatos:', err);
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleUrlBlur = () => {
    if (formData.url && !formData.url_imagen) {
      fetchMetadata(formData.url);
    }
  };

  const handleAddRegalo = async () => {
    if (!formData.nombre.trim()) {
      setErrors({ nombre: 'El nombre es requerido' });
      return;
    }

    try {
      const response = await fetch(`/api/personas/${personaId}/regalos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const nuevoRegalo = await response.json();
        resetForm();
        setIsAddModalOpen(false);
        fetchPersona();
        
        // Emitir evento WebSocket
        if (socket && persona) {
          socket.emit('regalo:created', {
            personaId: parseInt(personaId),
            personaNombre: persona.nombre,
            regalo: nuevoRegalo,
          });
        }
      }
    } catch (err) {
      console.error('Error al crear regalo:', err);
    }
  };

  const handleEditRegalo = async () => {
    if (!formData.nombre.trim() || !selectedRegalo) {
      setErrors({ nombre: 'El nombre es requerido' });
      return;
    }

    try {
      const response = await fetch(
        `/api/personas/${personaId}/regalos/${selectedRegalo.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const regaloActualizado = await response.json();
        resetForm();
        setIsEditModalOpen(false);
        setSelectedRegalo(null);
        fetchPersona();
        
        // Emitir evento WebSocket
        if (socket && persona) {
          socket.emit('regalo:updated', {
            personaId: parseInt(personaId),
            personaNombre: persona.nombre,
            regalo: regaloActualizado,
          });
        }
      }
    } catch (err) {
      console.error('Error al editar regalo:', err);
    }
  };

  const handleDeleteRegalo = async () => {
    if (!selectedRegalo) return;

    try {
      const response = await fetch(
        `/api/personas/${personaId}/regalos/${selectedRegalo.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        const regaloNombre = selectedRegalo.nombre;
        setIsDeleteModalOpen(false);
        setSelectedRegalo(null);
        fetchPersona();
        
        // Emitir evento WebSocket
        if (socket && persona) {
          socket.emit('regalo:deleted', {
            personaId: parseInt(personaId),
            personaNombre: persona.nombre,
            regaloNombre,
          });
        }
      }
    } catch (err) {
      console.error('Error al eliminar regalo:', err);
    }
  };

  const handleToggleTomado = async (regalo: Regalo) => {
    try {
      const response = await fetch(`/api/personas/${personaId}/regalos/${regalo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tomado: !regalo.tomado }),
      });
      
      if (response.ok) {
        const regaloActualizado = await response.json();
        fetchPersona();
        
        // Emitir evento WebSocket
        if (socket && persona) {
          socket.emit('regalo:updated', {
            personaId: parseInt(personaId),
            personaNombre: persona.nombre,
            regalo: regaloActualizado,
          });
        }
      }
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const openAddModal = () => {
    if (persona && persona.regalos.length >= 10) {
      return;
    }
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (regalo: Regalo) => {
    setSelectedRegalo(regalo);
    setFormData({
      nombre: regalo.nombre,
      url: regalo.url || '',
      url_imagen: regalo.url_imagen || '',
      lugarCompra: regalo.lugarCompra || '',
    });
    setErrors({ nombre: '' });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (regalo: Regalo) => {
    setSelectedRegalo(regalo);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ nombre: '', url: '', url_imagen: '', lugarCompra: '' });
    setErrors({ nombre: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-600">Cargando...</p>
      </div>
    );
  }

  if (!persona) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            Volver
          </button>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Package size={28} className="text-stone-700 sm:w-8 sm:h-8" strokeWidth={1.5} />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-stone-900 tracking-tight break-words">
              Regalos de {persona.nombre}
            </h1>
          </div>
          <p className="text-stone-600 text-xs sm:text-sm ml-8 sm:ml-11">
            {persona.regalos.length}{' '}
            {persona.regalos.length === 1 ? 'regalo' : 'regalos'}
          </p>
        </div>

        {/* Lista de regalos */}
        <div className="space-y-4">
          {persona.regalos.length === 0 ? (
            <div className="text-center py-12 border border-stone-300 bg-stone-100">
              <p className="text-stone-600 mb-4">No hay regalos registrados</p>
              <Button onClick={openAddModal}>
                <Plus size={16} className="inline mr-2" />
                Adicionar Primer Regalo
              </Button>
            </div>
          ) : (
            persona.regalos.map((regalo) => (
              <div
                key={regalo.id}
                className={`bg-stone-100 border border-stone-300 p-3 sm:p-4 hover:border-stone-400 transition-colors ${
                  regalo.tomado ? 'opacity-60' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Imagen */}
                  {regalo.url_imagen ? (
                    <div className="w-full h-48 sm:w-24 sm:h-24 flex-shrink-0 bg-stone-200 border border-stone-300 overflow-hidden relative">
                      <Image
                        src={regalo.url_imagen}
                        alt={regalo.nombre}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 sm:w-24 sm:h-24 flex-shrink-0 bg-stone-200 border border-stone-300 flex items-center justify-center">
                      <Package size={32} className="text-stone-400" />
                    </div>
                  )}

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-base sm:text-lg font-medium break-words ${
                            regalo.tomado
                              ? 'text-stone-600 line-through'
                              : 'text-stone-900'
                          }`}
                        >
                          {regalo.nombre}
                        </h3>
                        {regalo.lugarCompra && (
                          <p className="text-xs sm:text-sm text-stone-600 mt-1 break-words">
                            📍 {regalo.lugarCompra}
                          </p>
                        )}
                        {regalo.url && (
                          <a
                            href={regalo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-stone-700 hover:text-stone-900 inline-flex items-center gap-1 mt-1 break-all"
                          >
                            <ExternalLink size={14} />
                            Ver enlace
                          </a>
                        )}
                      </div>
                      <Dropdown>
                        <DropdownItem onClick={() => handleToggleTomado(regalo)}>
                          {regalo.tomado ? 'Marcar disponible' : 'Marcar tomado'}
                        </DropdownItem>
                        <DropdownItem onClick={() => openEditModal(regalo)}>
                          Editar
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => openDeleteModal(regalo)}
                          variant="danger"
                        >
                          Borrar
                        </DropdownItem>
                      </Dropdown>
                    </div>
                    {regalo.tomado && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-stone-300 text-stone-700 border border-stone-400">
                        TOMADO
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botón adicionar */}
        {persona.regalos.length > 0 && persona.regalos.length < 10 && (
          <div className="mt-6">
            <Button onClick={openAddModal} className="w-full">
              <Plus size={16} className="inline mr-2" />
              Adicionar Regalo
            </Button>
          </div>
        )}

        {/* Mensaje límite alcanzado */}
        {persona.regalos.length >= 10 && (
          <div className="mt-6 text-center py-4 bg-stone-200 border border-stone-300">
            <p className="text-sm text-stone-700">
              Límite de 10 regalos alcanzado
            </p>
          </div>
        )}
      </div>

      {/* Modal Adicionar/Editar */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedRegalo(null);
        }}
        title={isEditModalOpen ? 'Editar Regalo' : 'Adicionar Regalo'}
      >
        <div className="space-y-4">
          <Input
            label="Nombre *"
            value={formData.nombre}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nombre: e.target.value }))
            }
            placeholder="Nombre del regalo"
            error={errors.nombre}
            autoFocus
          />
          <Input
            label="URL"
            value={formData.url}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, url: e.target.value }))
            }
            onBlur={handleUrlBlur}
            placeholder="https://ejemplo.com/producto"
          />
          {loadingMetadata && (
            <p className="text-sm text-stone-600">Obteniendo imagen...</p>
          )}
          <Input
            label="URL de Imagen"
            value={formData.url_imagen}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, url_imagen: e.target.value }))
            }
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          <Input
            label="Lugar de Compra"
            value={formData.lugarCompra}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, lugarCompra: e.target.value }))
            }
            placeholder="Tienda o lugar"
          />
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedRegalo(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={isEditModalOpen ? handleEditRegalo : handleAddRegalo}>
              {isEditModalOpen ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Borrar */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
      >
        <div className="space-y-4">
          <p className="text-stone-700">
            ¿Estás seguro de que deseas eliminar el regalo{' '}
            <strong>{selectedRegalo?.nombre}</strong>? Esta acción no se puede
            deshacer.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteRegalo}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
