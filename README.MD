# Sistema de Reservas de Consultorios Médicos

*Sistema de Reservas de Consultorios Médicos* es una plataforma web para gestionar citas en consultorios de manera eficiente, con consultas avanzadas para análisis de ocupación y asistencia.

---

## 🔖 Tabla de contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Modelos de la base de datos](#modelos-de-la-base-de-datos)
- [Consultas avanzadas](#consultas-avanzadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Contribuidores](#contribuidores)
- [Licencia](#licencia)
- [Contacto](#contacto)

---

## 📋 Descripción

Este proyecto permite:

- Registro y autenticación de pacientes y médicos.  
- Gestión de especialidades y horarios disponibles.  
- Reserva, modificación y cancelación de citas.  
- Reportes analíticos con consultas avanzadas.

---

## 🛠 Tecnologías

- *Backend*: Django, Django REST Framework, MySQL  
- *Frontend*: Vite, React, React Router  
- *Control de versiones*: Git, GitHub

---

## 📦 Requisitos previos

- Python 3.8+  
- Node.js 16+  
- MySQL Server Worbrench
- Git

---

## 🚀 Instalación

1. *Clonar repositorio*

   ```bash
   git clone https://github.com/JacoboSolarte/reservamed    ica.git
   cd reservamedica
   

##  Backend 

   cd backend
python -m venv venv
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cd medical 
cd medical 
# Ejecutar migraciones y cargar datos iniciales
python manage.py migrate
python manage.py loaddata fixtures/initial_data.json

# Iniciar servidor de desarrollo
python manage.py runserver


## Frontend 

cd frontend
cd frontend 
npm install
npm run dev