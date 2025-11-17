'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Gift } from 'lucide-react';
import { Persona } from '@/types';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Dropdown, { DropdownItem } from '@/components/Dropdown';
import { useSocket } from '@/lib/socket';

export default function HomePage() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPersonas();

    // Escuchar eventos de WebSocket
    if (socket) {
      socket.on('persona:updated', () => {
        fetchPersonas();
      });

      socket.on('persona:deleted', () => {
        fetchPersonas();
      });

      return () => {
        socket.off('persona:updated');
        socket.off('persona:deleted');
      };
    }
  }, [socket]);

  const fetchPersonas = async () => {
    try {
      const response = await fetch('/api/personas');
      const data = await response.json();
      setPersonas(data);
    } catch (err) {
      console.error('Error al cargar personas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPersona = async () => {
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });

      if (response.ok) {
        const nuevaPersona = await response.json();
        setNombre('');
        setError('');
        setIsAddModalOpen(false);
        fetchPersonas();
        
        // Emitir evento WebSocket
        if (socket) {
          socket.emit('persona:created', nuevaPersona);
        }
      }
    } catch (err) {
      console.error('Error al crear persona:', err);
      setError('Error al crear persona');
    }
  };

  const handleEditPersona = async () => {
    if (!nombre.trim() || !selectedPersona) {
      setError('El nombre es requerido');
      return;
    }

    try {
      const response = await fetch(`/api/personas/${selectedPersona.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });

      if (response.ok) {
        const personaActualizada = await response.json();
        setNombre('');
        setError('');
        setIsEditModalOpen(false);
        setSelectedPersona(null);
        fetchPersonas();
        
        // Emitir evento WebSocket
        if (socket) {
          socket.emit('persona:updated', personaActualizada);
        }
      }
    } catch (err) {
      console.error('Error al editar persona:', err);
      setError('Error al editar persona');
    }
  };

  const handleDeletePersona = async () => {
    if (!selectedPersona) return;

    try {
      const response = await fetch(`/api/personas/${selectedPersona.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsDeleteModalOpen(false);
        const personaNombre = selectedPersona.nombre;
        setSelectedPersona(null);
        fetchPersonas();
        
        // Emitir evento WebSocket
        if (socket) {
          socket.emit('persona:deleted', { nombre: personaNombre });
        }
      }
    } catch (err) {
      console.error('Error al eliminar persona:', err);
    }
  };

  const openEditModal = (persona: Persona) => {
    setSelectedPersona(persona);
    setNombre(persona.nombre);
    setError('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsDeleteModalOpen(true);
  };

  const openAddModal = () => {
    setNombre('');
    setError('');
    setIsAddModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Gift size={28} className="text-stone-700 sm:w-8 sm:h-8" strokeWidth={1.5} />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-stone-900 tracking-tight">
              Lista de Regalos
            </h1>
          </div>
          <p className="text-stone-600 text-xs sm:text-sm ml-8 sm:ml-11">
            Gestiona las personas y sus listas de regalos
          </p>
        </div>

        {/* Lista de personas */}
        <div className="space-y-3">
          {personas.length === 0 ? (
            <div className="text-center py-12 border border-stone-300 bg-stone-100">
              <p className="text-stone-600 mb-4">No hay personas registradas</p>
              <Button onClick={openAddModal}>
                <Plus size={16} className="inline mr-2" />
                Adicionar Primera Persona
              </Button>
            </div>
          ) : (
            personas.map((persona) => (
              <div
                key={persona.id}
                className="bg-stone-100 border border-stone-300 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-stone-400 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-medium text-stone-900 truncate">
                    {persona.nombre}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600">
                    {persona.regalos.length} {persona.regalos.length === 1 ? 'regalo' : 'regalos'}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/persona/${persona.id}/regalos`)}
                    className="text-sm sm:text-base"
                  >
                    Ver Regalos
                  </Button>
                  <Dropdown>
                    <DropdownItem onClick={() => openEditModal(persona)}>
                      Editar
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => openDeleteModal(persona)}
                      variant="danger"
                    >
                      Borrar
                    </DropdownItem>
                  </Dropdown>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botón adicionar */}
        {personas.length > 0 && (
          <div className="mt-6">
            <Button onClick={openAddModal} className="w-full">
              <Plus size={16} className="inline mr-2" />
              Adicionar Persona
            </Button>
          </div>
        )}
      </div>

      {/* Modal Adicionar */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Adicionar Persona"
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ingresa el nombre"
            error={error}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPersona}>Crear</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Editar */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Persona"
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ingresa el nombre"
            error={error}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditPersona}>Guardar</Button>
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
            ¿Estás seguro de que deseas eliminar a{' '}
            <strong>{selectedPersona?.nombre}</strong>? Esta acción no se puede deshacer y
            se eliminarán todos sus regalos.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeletePersona}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

