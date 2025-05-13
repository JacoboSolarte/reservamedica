import { useEffect, useState } from 'react';
import API from '../api';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    cedula: '',
    correo: '',
    telefono: '',
    direccion: ''
  });
  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(false);

  // Validaciones del formulario
  const validarFormulario = () => {
    const nuevosErrores = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cedulaRegex = /^[0-9]{7,10}$/;
    const telefonoRegex = /^[0-9]{7,15}$/;

    if (!nuevoPaciente.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (nuevoPaciente.nombre.length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!nuevoPaciente.cedula.trim()) {
      nuevosErrores.cedula = 'La cédula es requerida';
    } else if (!cedulaRegex.test(nuevoPaciente.cedula)) {
      nuevosErrores.cedula = 'La cédula debe tener entre 7 y 10 dígitos';
    }

    if (!nuevoPaciente.correo.trim()) {
      nuevosErrores.correo = 'El correo es requerido';
    } else if (!emailRegex.test(nuevoPaciente.correo)) {
      nuevosErrores.correo = 'Ingrese un correo electrónico válido';
    }

    if (nuevoPaciente.telefono && !telefonoRegex.test(nuevoPaciente.telefono)) {
      nuevosErrores.telefono = 'Ingrese un número de teléfono válido (7-15 dígitos)';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejo del formulario para agregar un nuevo paciente
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoPaciente({
      ...nuevoPaciente,
      [name]: value
    });
    
    // Limpiar el error cuando el usuario empieza a escribir
    if (errores[name]) {
      setErrores({
        ...errores,
        [name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    
    if (!validarFormulario()) return;
    
    setCargando(true);
    
    try {
      const res = await API.post('pacientes/', nuevoPaciente);
      setPacientes([...pacientes, res.data]);
      setNuevoPaciente({
        nombre: '',
        cedula: '',
        correo: '',
        telefono: '',
        direccion: ''
      });
      setMensajeExito('Paciente agregado con éxito!');
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setErrores({
          ...errores,
          api: err.response.data.message || 'Error al agregar paciente'
        });
      } else {
        setErrores({
          ...errores,
          api: 'Error de conexión con el servidor'
        });
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const obtenerPacientes = async () => {
      try {
        const res = await API.get('pacientes/');
        setPacientes(res.data);
      } catch (err) {
        console.error(err);
        setErrores({
          ...errores,
          api: 'Error al cargar los pacientes'
        });
      }
    };
    
    obtenerPacientes();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Gestión de Pacientes</h1>

      {/* Formulario para agregar pacientes */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-6 space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Agregar Nuevo Paciente</h2>
        
        {mensajeExito && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {mensajeExito}
          </div>
        )}
        
        {errores.api && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errores.api}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="nombre"
              value={nuevoPaciente.nombre}
              onChange={handleInputChange}
              placeholder="Nombre completo"
              className={`p-3 border ${errores.nombre ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full`}
            />
            {errores.nombre && <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>}
          </div>
          <div>
            <input
              type="text"
              name="cedula"
              value={nuevoPaciente.cedula}
              onChange={handleInputChange}
              placeholder="Cédula"
              className={`p-3 border ${errores.cedula ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full`}
            />
            {errores.cedula && <p className="text-red-500 text-sm mt-1">{errores.cedula}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="email"
              name="correo"
              value={nuevoPaciente.correo}
              onChange={handleInputChange}
              placeholder="Correo electrónico"
              className={`p-3 border ${errores.correo ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full`}
            />
            {errores.correo && <p className="text-red-500 text-sm mt-1">{errores.correo}</p>}
          </div>
          <div>
            <input
              type="text"
              name="telefono"
              value={nuevoPaciente.telefono}
              onChange={handleInputChange}
              placeholder="Teléfono (opcional)"
              className={`p-3 border ${errores.telefono ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full`}
            />
            {errores.telefono && <p className="text-red-500 text-sm mt-1">{errores.telefono}</p>}
          </div>
        </div>
        
        <div>
          <input
            type="text"
            name="direccion"
            value={nuevoPaciente.direccion}
            onChange={handleInputChange}
            placeholder="Dirección (opcional)"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={cargando}
          className={`w-full ${cargando ? 'bg-blue-400' : 'bg-blue-500'} text-white p-3 rounded-md font-semibold hover:bg-blue-600 disabled:cursor-not-allowed`}
        >
          {cargando ? 'Agregando...' : 'Agregar Paciente'}
        </button>
      </form>

      {/* Lista de pacientes */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Lista de Pacientes</h2>
        {errores.api && pacientes.length === 0 ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errores.api}
          </div>
        ) : (
          <ul className="space-y-4">
            {pacientes.length === 0 ? (
              <p className="text-center text-gray-500">No hay pacientes registrados.</p>
            ) : (
              pacientes.map(paciente => (
                <li key={paciente.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div>
                    <strong className="text-lg">{paciente.nombre}</strong><br />
                    <span className="text-sm text-gray-600">{paciente.cedula} - {paciente.correo}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {paciente.telefono && <div>Tel: {paciente.telefono}</div>}
                    {paciente.direccion && <div>Dir: {paciente.direccion}</div>}
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}