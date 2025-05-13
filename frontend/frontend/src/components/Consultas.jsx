import { useEffect, useState } from 'react';
import API from '../api';

export default function Consultas() {
  // Lista de diagnósticos predefinidos
  const DIAGNOSTICOS_PREDEFINIDOS = [
    { value: 'resfriado_comun', label: 'Resfriado común' },
    { value: 'hipertension_arterial', label: 'Hipertensión arterial' },
    { value: 'diabetes_mellitus', label: 'Diabetes mellitus' },
    { value: 'gastritis', label: 'Gastritis' },
    { value: 'ansiedad_generalizada', label: 'Ansiedad generalizada' },
    { value: 'lumbalgia', label: 'Lumbalgia' },
    { value: 'migrana', label: 'Migraña' },
    { value: 'asma', label: 'Asma' },
    { value: 'artritis', label: 'Artritis' },
    { value: 'depresion', label: 'Depresión' },
    { value: 'influenza', label: 'Influenza (Gripe)' },
    { value: 'bronquitis_aguda', label: 'Bronquitis aguda' },
    { value: 'neumonia', label: 'Neumonía' },
    { value: 'cardiopatia_isquemica', label: 'Cardiopatía isquémica' },
    { value: 'arritmia_cardiaca', label: 'Arritmia cardíaca' }
  ];

  const ESTADO_CHOICES = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'falta', label: 'falta' },
    { value: 'realizada', label: 'Realizada' }
  ];

  // Estados del componente
  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [nuevaConsulta, setNuevaConsulta] = useState({
    paciente: '',
    medico: '',
    fecha: '',
    estado: '',
    diagnostico: '',
    diagnosticoPredefinido: ''
  });

  const [errores, setErrores] = useState({});
  const [filtros, setFiltros] = useState({
    paciente: '',
    medico: '',
    estado: '',
    diagnostico: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    API.get('consultas/')
      .then(res => setConsultas(res.data))
      .catch(err => console.error(err));

    API.get('pacientes/')
      .then(res => setPacientes(res.data))
      .catch(err => console.error(err));

    API.get('medicos/')
      .then(res => setMedicos(res.data))
      .catch(err => console.error(err));
  };

  // Manejo de cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'diagnosticoPredefinido') {
      setNuevaConsulta({ 
        ...nuevaConsulta, 
        diagnosticoPredefinido: value,
        diagnostico: DIAGNOSTICOS_PREDEFINIDOS.find(d => d.value === value)?.label || ''
      });
      return;
    }
    
    if (name === 'diagnostico' && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:()\-]+$/.test(value) && value !== '') {
      setError('El diagnóstico solo puede contener letras, números y signos de puntuación básicos');
      return;
    }
    
    setError('');
    setNuevaConsulta({ ...nuevaConsulta, [name]: value });
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  // Validación de campos
  const validarCampos = () => {
    const nuevosErrores = {};
    const ahora = new Date();
    const fechaSeleccionada = nuevaConsulta.fecha ? new Date(nuevaConsulta.fecha) : null;

    if (!nuevaConsulta.paciente) nuevosErrores.paciente = "Debe seleccionar un paciente.";
    if (!nuevaConsulta.medico) nuevosErrores.medico = "Debe seleccionar un médico.";
    
    if (!nuevaConsulta.fecha) {
      nuevosErrores.fecha = "Debe ingresar la fecha de la consulta.";
    } else if (fechaSeleccionada && fechaSeleccionada < ahora) {
      nuevosErrores.fecha = "La fecha debe ser posterior a la fecha y hora actual.";
    }
    
    if (!nuevaConsulta.estado) nuevosErrores.estado = "Debe seleccionar un estado.";
    if (!nuevaConsulta.diagnostico.trim()) nuevosErrores.diagnostico = "Debe ingresar un diagnóstico.";
    
    if (nuevaConsulta.diagnostico.trim() && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:()\-]+$/.test(nuevaConsulta.diagnostico)) {
      nuevosErrores.diagnostico = "El diagnóstico contiene caracteres no válidos";
    }

    return nuevosErrores;
  };

  // Envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const erroresValidados = validarCampos();
    if (Object.keys(erroresValidados).length > 0) {
      setErrores(erroresValidados);
      return;
    }

    setErrores({});

    // Preparar datos para enviar (eliminamos diagnosticoPredefinido que es solo para UI)
    const { diagnosticoPredefinido, ...datosEnvio } = nuevaConsulta;

    API.post('consultas/', datosEnvio)
      .then(res => {
        setConsultas([...consultas, res.data]);
        setNuevaConsulta({
          paciente: '',
          medico: '',
          fecha: '',
          estado: '',
          diagnostico: '',
          diagnosticoPredefinido: ''
        });
        setSuccess('Consulta agregada con éxito');
      })
      .catch(err => {
        if (err.response && err.response.status === 400) {
          setError('Error: Ya existe una consulta con estos datos');
        } else {
          setError('Error al agregar consulta');
          console.error(err);
        }
      });
  };

  // Funciones auxiliares
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const filtrarConsultas = () => {
    return consultas.filter(consulta => {
      const pacienteMatch = filtros.paciente === '' || 
        (consulta.paciente?.nombre && consulta.paciente.nombre.toLowerCase().includes(filtros.paciente.toLowerCase()));
      
      const medicoMatch = filtros.medico === '' || 
        (consulta.medico?.nombre && consulta.medico.nombre.toLowerCase().includes(filtros.medico.toLowerCase()));
      
      const estadoMatch = filtros.estado === '' || 
        consulta.estado === filtros.estado;
      
      const diagnosticoMatch = filtros.diagnostico === '' || 
        (consulta.diagnostico && consulta.diagnostico.toLowerCase().includes(filtros.diagnostico.toLowerCase()));
      
      return pacienteMatch && medicoMatch && estadoMatch && diagnosticoMatch;
    });
  };

  // Cálculo de estadísticas
  const obtenerEstadisticas = () => {
    const consultasPorEspecialidad = {};
    const consultasPorMedico = {};
    const medicosPorEspecialidad = {};
    const pacientesFaltantes = {};
    const ocupacionMedicos = {};

    consultas.forEach(consulta => {
      // Por especialidad
      if (consulta.medico?.especialidad) {
        consultasPorEspecialidad[consulta.medico.especialidad] = 
          (consultasPorEspecialidad[consulta.medico.especialidad] || 0) + 1;
        
        if (!medicosPorEspecialidad[consulta.medico.especialidad]) {
          medicosPorEspecialidad[consulta.medico.especialidad] = {};
        }
        
        if (consulta.medico.id) {
          medicosPorEspecialidad[consulta.medico.especialidad][consulta.medico.id] = 
            (medicosPorEspecialidad[consulta.medico.especialidad][consulta.medico.id] || 0) + 1;
        }
      }

      // Por médico
      if (consulta.medico?.nombre) {
        consultasPorMedico[consulta.medico.nombre] = 
          (consultasPorMedico[consulta.medico.nombre] || 0) + 1;
      }

      // Ocupación de médicos
      if (consulta.medico?.id && consulta.duracion) {
        ocupacionMedicos[consulta.medico.id] = 
          (ocupacionMedicos[consulta.medico.id] || 0) + parseInt(consulta.duracion);
      }

      // Pacientes faltantes
      if (consulta.paciente?.id && consulta.asistio === false) {
        pacientesFaltantes[consulta.paciente.id] = 
          (pacientesFaltantes[consulta.paciente.id] || 0) + 1;
      }
    });

    // Encontrar el médico con más consultas por especialidad
    const medicosLideres = Object.entries(medicosPorEspecialidad).map(([especialidad, medicosObj]) => {
      let maxConsultas = 0;
      let medicoId = null;
      
      Object.entries(medicosObj).forEach(([id, count]) => {
        if (count > maxConsultas) {
          maxConsultas = count;
          medicoId = id;
        }
      });

      const medico = medicoId ? medicos.find(m => m.id === parseInt(medicoId)) : null;
      
      return {
        especialidad,
        medico: medico ? medico.nombre : 'N/A',
        consultas: maxConsultas
      };
    });

    // Ordenar especialidades por cantidad de consultas (de mayor a menor)
    const especialidadesOrdenadas = Object.entries(consultasPorEspecialidad)
      .sort((a, b) => b[1] - a[1])
      .map(([especialidad, count]) => ({
        especialidad,
        count
      }));

    return {
      especialidadesOrdenadas,
      medicosLideres,
      consultasPorMedico,
      pacientesFaltantes: Object.entries(pacientesFaltantes)
        .filter(([_, faltas]) => faltas > 2)
        .map(([id, faltas]) => ({
          id,
          faltas,
          nombre: pacientes.find(p => p.id === parseInt(id))?.nombre || 'Desconocido'
        })),
      medicosOcupados: Object.entries(ocupacionMedicos)
        .sort((a, b) => b[1] - a[1])
        .map(([id, minutos]) => ({
          id,
          minutos,
          nombre: medicos.find(m => m.id === parseInt(id))?.nombre || 'Desconocido',
          especialidad: medicos.find(m => m.id === parseInt(id))?.especialidad || 'N/A'
        }))
    };
  };

  const estadisticas = obtenerEstadisticas();
  const consultasFiltradas = filtrarConsultas();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Consultas</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Agregar Consulta</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <select
              name="paciente"
              value={nuevaConsulta.paciente}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
              required
            >
              <option value="">Seleccionar Paciente</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            {errores.paciente && <p className="text-red-500 text-sm">{errores.paciente}</p>}
          </div>

          <div>
            <select
              name="medico"
              value={nuevaConsulta.medico}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
              required
            >
              <option value="">Seleccionar Médico</option>
              {medicos.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
            {errores.medico && <p className="text-red-500 text-sm">{errores.medico}</p>}
          </div>

          <div>
            <input
              type="datetime-local"
              name="fecha"
              value={nuevaConsulta.fecha}
              onChange={handleInputChange}
              min={getMinDateTime()}
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
              required
            />
            {errores.fecha && <p className="text-red-500 text-sm">{errores.fecha}</p>}
          </div>

          <div>
            <select
              name="estado"
              value={nuevaConsulta.estado}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
              required
            >
              <option value="">Seleccionar Estado</option>
              {ESTADO_CHOICES.map(opcion => (
                <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
              ))}
            </select>
            {errores.estado && <p className="text-red-500 text-sm">{errores.estado}</p>}
          </div>

          <div className="sm:col-span-2">
            <div className="mb-2">
              <select
                name="diagnosticoPredefinido"
                value={nuevaConsulta.diagnosticoPredefinido}
                onChange={handleInputChange}
                className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="">Seleccionar diagnóstico predefinido</option>
                {DIAGNOSTICOS_PREDEFINIDOS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              name="diagnostico"
              placeholder="O ingrese diagnóstico manualmente"
              value={nuevaConsulta.diagnostico}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
              required
            />
            {errores.diagnostico && <p className="text-red-500 text-sm">{errores.diagnostico}</p>}
            <p className="text-xs text-gray-500 mt-1">Letras, números y signos básicos de puntuación</p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Guardar Consulta
        </button>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Filtrar Consultas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              name="paciente"
              placeholder="Filtrar por paciente"
              value={filtros.paciente}
              onChange={handleFiltroChange}
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div>
            <input
              type="text"
              name="medico"
              placeholder="Filtrar por médico"
              value={filtros.medico}
              onChange={handleFiltroChange}
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div>
            <select
              name="estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
            >
              <option value="">Todos los estados</option>
              {ESTADO_CHOICES.map(opcion => (
                <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              name="diagnostico"
              placeholder="Filtrar por diagnóstico"
              value={filtros.diagnostico}
              onChange={handleFiltroChange}
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Estadísticas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Especialidades con más consultas</h3>
            <ul className="space-y-2">
              {estadisticas.especialidadesOrdenadas.map(({especialidad, count}) => (
                <li key={especialidad} className="flex justify-between">
                  <span>{especialidad}</span>
                  <span className="font-semibold">{count} consultas</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Médicos más ocupados</h3>
            <ul className="space-y-2">
              {estadisticas.medicosOcupados.slice(0, 5).map(medico => (
                <li key={medico.id} className="flex flex-col">
                  <div className="flex justify-between">
                    <span>{medico.nombre}</span>
                    <span className="font-semibold">{medico.minutos} minutos</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Especialidad:</span> {medico.especialidad}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Médicos líderes por especialidad</h3>
            <ul className="space-y-2">
              {estadisticas.medicosLideres.map(({especialidad, medico, consultas}) => (
                <li key={especialidad} className="flex flex-col">
                  <div className="flex justify-between">
                    <span>{especialidad}</span>
                    <span className="font-semibold">{medico}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Consultas:</span> {consultas}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Pacientes con más de 2 faltas</h3>
            {estadisticas.pacientesFaltantes.length > 0 ? (
              <ul className="space-y-2">
                {estadisticas.pacientesFaltantes.map(paciente => (
                  <li key={paciente.id} className="flex justify-between">
                    <span>{paciente.nombre}</span>
                    <span className="font-semibold">{paciente.faltas} faltas</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No hay pacientes con más de 2 faltas</p>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Historial de Consultas</h2>
      <div className="mb-4 text-gray-600">
        Mostrando {consultasFiltradas.length} de {consultas.length} consultas
      </div>
      <ul className="space-y-4">
        {consultasFiltradas.length === 0 ? (
          <li className="text-center text-gray-500">No hay consultas que coincidan con los filtros.</li>
        ) : (
          consultasFiltradas.map(consulta => (
            <li key={consulta.id} className="bg-white p-4 rounded-lg shadow flex flex-col gap-1">
              <div><strong>Paciente:</strong> {consulta.paciente?.nombre || 'N/A'}</div>
              <div><strong>Médico:</strong> {consulta.medico?.nombre || 'N/A'}</div>
              <div><strong>Especialidad:</strong> {consulta.medico?.especialidad || 'N/A'}</div>
              <div><strong>Fecha:</strong> {consulta.fecha ? new Date(consulta.fecha).toLocaleString() : 'N/A'}</div>
              <div><strong>Estado:</strong> <span className={`font-semibold ${consulta.estado === 'pendiente' ? 'text-yellow-600' : 'text-green-600'}`}>
                {consulta.estado || 'N/A'}
              </span></div>
              <div><strong>Diagnóstico:</strong> {consulta.diagnostico || 'N/A'}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}