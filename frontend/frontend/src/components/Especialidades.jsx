import { useEffect, useState } from 'react';
import API from '../api';

export default function Especialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const handleInputChange = (e) => {
    setNuevaEspecialidad(e.target.value);
    setMensaje({ tipo: '', texto: '' }); // Limpiar mensaje
  };

  const validarEspecialidad = (nombre) => {
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/;
    return regex.test(nombre);
  };

  const yaExisteEspecialidad = (nombre) => {
    return especialidades.some(
      (esp) => esp.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nombre = nuevaEspecialidad.trim();

    if (!nombre) {
      setMensaje({ tipo: 'error', texto: 'El nombre de la especialidad es obligatorio.' });
      return;
    }

    if (!validarEspecialidad(nombre)) {
      setMensaje({
        tipo: 'error',
        texto: 'El nombre debe tener al menos 3 letras y solo puede contener letras y espacios.'
      });
      return;
    }

    if (yaExisteEspecialidad(nombre)) {
      setMensaje({ tipo: 'error', texto: 'La especialidad ya está registrada.' });
      return;
    }

    API.post('especialidades/', { nombre })
      .then((res) => {
        setEspecialidades([...especialidades, res.data]);
        setNuevaEspecialidad('');
        setMensaje({ tipo: 'exito', texto: '¡Especialidad agregada con éxito!' });
      })
      .catch((err) => {
        console.error(err);
        setMensaje({ tipo: 'error', texto: 'Ocurrió un error al guardar la especialidad.' });
      });
  };

  useEffect(() => {
    API.get('especialidades/')
      .then((res) => setEspecialidades(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Gestión de Especialidades</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-6 space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Agregar Nueva Especialidad</h2>

        <input
          type="text"
          value={nuevaEspecialidad}
          onChange={handleInputChange}
          placeholder="Nombre de la especialidad"
          className={`w-full p-3 border ${
            mensaje.tipo === 'error' ? 'border-red-500' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-2 ${
            mensaje.tipo === 'error' ? 'focus:ring-red-500' : 'focus:ring-blue-500'
          }`}
          required
        />

        {mensaje.texto && (
          <p
            className={`text-sm font-medium ${
              mensaje.tipo === 'error' ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {mensaje.texto}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold hover:bg-blue-600"
        >
          Agregar Especialidad
        </button>
      </form>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Lista de Especialidades</h2>
        <ul className="space-y-4">
          {especialidades.length === 0 ? (
            <p className="text-center text-gray-500">No hay especialidades registradas.</p>
          ) : (
            especialidades.map((especialidad) => (
              <li key={especialidad.id} className="bg-white p-4 rounded-lg shadow-md">
                <strong className="text-lg">{especialidad.nombre}</strong>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
