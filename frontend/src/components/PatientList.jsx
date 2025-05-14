import React, { useState, useEffect } from 'react';
import { patientService } from '../services/patient.service';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAll();
      setPatients(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los pacientes');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando pacientes...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="patient-list">
      <h2>Lista de Pacientes</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>DNI</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.firstName}</td>
              <td>{patient.lastName}</td>
              <td>{patient.dni}</td>
              <td>{patient.phone}</td>
              <td>{patient.email}</td>
              <td>
                <button onClick={() => handleEdit(patient.id)}>Editar</button>
                <button onClick={() => handleDelete(patient.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientList; 