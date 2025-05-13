import { useEffect, useState } from 'react';
import API from '../api';

export default function Medicos() {
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [nuevoMedico, setNuevoMedico] = useState({
    nombre: '',
    cedula_profesional: '',
    especialidad: '',
    horario: ''
  });

  useEffect(() => {
    API.get('medicos/')
      .then(res => setMedicos(res.data))
      .catch(err => console.error(err));

    API.get('especialidades/')
      .then(res => setEspecialidades(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validación de caracteres permitidos
    if (name === 'nombre' && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value) && value !== '') {
      setError('El nombre solo puede contener letras y espacios');
      return;
    }
    
    if (name === 'cedula_profesional' && !/^[a-zA-Z0-9]+$/.test(value) && value !== '') {
      setError('La cédula profesional solo puede contener letras y números');
      return;
    }
    
    setError('');
    setNuevoMedico({
      ...nuevoMedico,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validación adicional antes de enviar
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nuevoMedico.nombre)) {
      setError('El nombre solo puede contener letras y espacios');
      return;
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(nuevoMedico.cedula_profesional)) {
      setError('La cédula profesional solo puede contener letras y números');
      return;
    }

    API.post('medicos/', nuevoMedico)
      .then(res => {
        setMedicos([...medicos, res.data]);
        setNuevoMedico({
          nombre: '',
          cedula_profesional: '',
          especialidad: '',
          horario: ''
        });
        setSuccess('Médico agregado con éxito');
      })
      .catch(err => {
        if (err.response && err.response.status === 400) {
          setError('Error: La cédula profesional ya está registrada');
        } else {
          setError('Error al agregar médico');
          console.error(err);
        }
      });
  };

  const getEspecialidadNombre = (id) => {
    const esp = especialidades.find(e => e.id === parseInt(id));
    return esp ? esp.nombre : 'Desconocida';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Gestión de Médicos</h1>

      {/* Mensajes de feedback */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      {/* Formulario para agregar médicos */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-6 space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Agregar Nuevo Médico</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="nombre"
              value={nuevoMedico.nombre}
              onChange={handleInputChange}
              placeholder="Nombre completo"
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Solo letras y espacios</p>
          </div>
          <div>
            <input
              type="text"
              name="cedula_profesional"
              value={nuevoMedico.cedula_profesional}
              onChange={handleInputChange}
              placeholder="Cédula Profesional"
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Letras y números sin espacios</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            name="especialidad"
            value={nuevoMedico.especialidad}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccione una especialidad</option>
            {especialidades.map(esp => (
              <option key={esp.id} value={esp.id}>
                {esp.nombre}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="horario"
            value={nuevoMedico.horario}
            onChange={handleInputChange}
            placeholder="Horario"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold hover:bg-blue-600"
        >
          Agregar Médico
        </button>
      </form>

      {/* Lista de médicos */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Lista de Médicos</h2>
        <ul className="space-y-4">
          {medicos.length === 0 ? (
            <p className="text-center text-gray-500">No hay médicos registrados.</p>
          ) : (
            medicos.map(medico => (
              <li
                key={medico.id}
                className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4"
              >
                <div>
                  <strong className="text-lg">{medico.nombre}</strong><br />
                  <span className="text-sm text-gray-600">
                    Cédula Profesional: {medico.cedula_profesional}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <div>Especialidad: {getEspecialidadNombre(medico.especialidad)}</div>
                  <div>Horario: {medico.horario}</div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}