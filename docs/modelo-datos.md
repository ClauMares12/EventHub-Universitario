# Modelo de datos - EventHub Universitario

## Colecciones

### users
| Campo | Tipo | Descripcion |
| --- | --- | --- |
| uid | string | Identificador del usuario autenticado |
| name | string | Nombre del usuario |
| email | string | Correo del usuario |
| role | string | admin u organizer |
| active | boolean | Estado del usuario |
| createdAt | timestamp | Fecha de creacion |
| updatedAt | timestamp | Fecha de actualizacion |

### event_categories
| Campo | Tipo | Descripcion |
| --- | --- | --- |
| name | string | Nombre de la categoria |
| description | string | Descripcion |
| active | boolean | Permite activar o desactivar |
| createdAt | timestamp | Fecha de creacion |
| updatedAt | timestamp | Fecha de actualizacion |
| createdBy | string | Usuario creador |

### events
| Campo | Tipo | Descripcion |
| --- | --- | --- |
| title | string | Nombre del evento |
| description | string | Detalle del evento |
| categoryId | string | Referencia a event_categories |
| location | string | Lugar |
| eventDate | string | Fecha en formato YYYY-MM-DD |
| startTime | string | Hora inicial |
| endTime | string | Hora final |
| capacity | number | Cupo maximo |
| status | string | draft, published, cancelled, finished |
| active | boolean | Estado del registro |
| createdAt | timestamp | Fecha de creacion |
| updatedAt | timestamp | Fecha de actualizacion |
| createdBy | string | Usuario creador |

### event_registrations
| Campo | Tipo | Descripcion |
| --- | --- | --- |
| eventId | string | Referencia a events |
| studentName | string | Nombre del asistente |
| studentEmail | string | Correo del asistente |
| studentId | string | Matricula |
| registeredAt | timestamp | Fecha de registro |
| status | string | registered, cancelled, attended |
| confirmationCode | string | Codigo de confirmacion |
| active | boolean | Estado del registro |
| createdAt | timestamp | Fecha de creacion |
| updatedAt | timestamp | Fecha de actualizacion |
| createdBy | string | Usuario creador o public |
