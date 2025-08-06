# 📝 Notion Todo Manager

Una aplicación web moderna construida con React y Vite que te permite agregar y gestionar tareas directamente en tu base de datos de Notion.

## 🚀 Características

- **Agregar tareas nuevas** a tu base de datos de Notion
- **Ver todas tus tareas existentes** desde la interfaz web
- **Agregar etiquetas/tags** para organizar tus tareas
- **Establecer fechas de vencimiento**
- **Interfaz responsive** que funciona en desktop y móvil
- **Integración directa** con la API oficial de Notion

## 📋 Requisitos Previos

Antes de usar esta aplicación, necesitas:

1. **Una cuenta de Notion** con una base de datos de tareas
2. **Una integración de Notion** configurada
3. **Node.js** instalado en tu sistema

## 🛠️ Configuración

### 1. Configurar la Integración de Notion

1. Ve a [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Haz clic en "New integration"
3. Nombra tu integración (ej: "Todo Manager")
4. Selecciona el workspace donde está tu base de datos
5. Haz clic en "Submit"
6. Copia el **Integration Token** (lo necesitarás después)

### 2. Obtener el ID de tu Base de Datos

1. Ve a tu página de tareas en Notion
2. En la URL, encontrarás algo como: `https://www.notion.so/tu-workspace/DATABASE_ID?v=...`
3. Copia el `DATABASE_ID` (32 caracteres alfanuméricos)

### 3. Dar Permisos a tu Integración

1. Ve a tu base de datos de tareas en Notion
2. Haz clic en los tres puntos (...) en la esquina superior derecha
3. Selecciona "Add connections"
4. Busca y selecciona la integración que creaste

### 4. Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edita el archivo `.env` y reemplaza los valores:
   ```env
   VITE_NOTION_API_KEY=tu_integration_token_aqui
   VITE_NOTION_DATABASE_ID=tu_database_id_aqui
   VITE_API_BASE_URL=http://localhost:5173
   ```

## 🏃‍♂️ Instalación y Ejecución

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador:**
   La aplicación estará disponible en `http://localhost:5173`

## 📖 Uso

### Agregar una Nueva Tarea

1. Completa el formulario con:
   - **Título de la tarea** (obligatorio)
   - **Etiquetas** (opcional, separadas por comas)
   - **Fecha de vencimiento** (opcional)

2. Haz clic en "Agregar a Notion"

3. La tarea aparecerá automáticamente en tu base de datos de Notion

### Ver Tareas Existentes

- Las tareas se cargan automáticamente al abrir la aplicación
- Usa el botón "🔄 Actualizar" para recargar las tareas
- Las tareas muestran título, etiquetas y fecha de vencimiento

## 🏗️ Estructura del Proyecto

```
notion-todos/
├── src/
│   ├── components/
│   │   ├── TodoForm.jsx      # Formulario para agregar tareas
│   │   ├── TodoForm.css      # Estilos del formulario
│   │   ├── TodoList.jsx      # Lista de tareas existentes
│   │   └── TodoList.css      # Estilos de la lista
│   ├── services/
│   │   └── notionService.js  # Servicio para API de Notion
│   ├── App.jsx               # Componente principal
│   ├── App.css              # Estilos principales
│   ├── index.css            # Estilos globales
│   └── main.jsx             # Punto de entrada
├── .env                     # Variables de entorno (no incluir en git)
├── .env.example            # Plantilla de variables
└── package.json            # Dependencias del proyecto
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Ejecuta la aplicación en modo desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter para revisar el código

## 🔧 Tecnologías Utilizadas

- **[React](https://reactjs.org/)** - Biblioteca para construir interfaces
- **[Vite](https://vitejs.dev/)** - Build tool rápido y moderno
- **[@notionhq/client](https://github.com/makenotion/notion-sdk-js)** - SDK oficial de Notion
- **[Axios](https://axios-http.com/)** - Cliente HTTP para JavaScript

## 🎨 Personalización

### Modificar Estilos

Los estilos están organizados en archivos CSS modulares:
- `src/App.css` - Estilos del layout principal
- `src/components/TodoForm.css` - Estilos del formulario
- `src/components/TodoList.css` - Estilos de la lista de tareas

### Agregar Nuevas Funcionalidades

El proyecto está estructurado para ser fácilmente extensible:
- Agrega nuevos componentes en `src/components/`
- Extiende el servicio de Notion en `src/services/notionService.js`
- Modifica el componente principal en `src/App.jsx`

## 📝 Estructura de la Base de Datos de Notion

La aplicación espera que tu base de datos tenga las siguientes propiedades:

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| Task name | Title | Título de la tarea |
| Tags | Multi-select | Etiquetas para categorizar |
| Due | Date | Fecha de vencimiento |

## 🐛 Resolución de Problemas

### Error: "unauthorized"
- Verifica que el token de integración sea correcto
- Asegúrate de haber compartido la base de datos con tu integración

### Error: "object_not_found"
- Verifica que el ID de la base de datos sea correcto
- Confirma que la base de datos existe y es accesible

### Las tareas no aparecen
- Revisa la consola del navegador para errores
- Verifica que las propiedades de la base de datos coincidan con las esperadas

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación de [Notion API](https://developers.notion.com/)
2. Consulta los issues en GitHub
3. Crea un nuevo issue con los detalles del problema

---

¡Esperamos que disfrutes usando Notion Todo Manager! 🎉+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
