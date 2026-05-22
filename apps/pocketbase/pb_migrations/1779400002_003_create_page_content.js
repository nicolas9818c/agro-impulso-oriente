/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "name": "page_content",
    "type": "base",
    "system": false,
    // Cualquier usuario autenticado puede leer el contenido
    "listRule": "",
    "viewRule": "",
    // Solo editors y admins pueden crear/editar/borrar
    "createRule": "@request.auth.role = 'editor' || @request.auth.role = 'admin'",
    "updateRule": "@request.auth.role = 'editor' || @request.auth.role = 'admin'",
    "deleteRule": "@request.auth.role = 'admin'",
    "fields": [
      {
        "type": "text",
        "name": "clave",
        "required": true,
        "presentable": true,
        "autogeneratePattern": "",
        "min": 1,
        "max": 120,
        "pattern": ""
      },
      {
        "type": "text",
        "name": "etiqueta",
        "required": true,
        "presentable": false,
        "autogeneratePattern": "",
        "min": 0,
        "max": 200,
        "pattern": ""
      },
      {
        "type": "text",
        "name": "valor",
        "required": false,
        "presentable": false,
        "autogeneratePattern": "",
        "min": 0,
        "max": 0,
        "pattern": ""
      },
      {
        "type": "select",
        "name": "seccion",
        "required": true,
        "presentable": false,
        "maxSelect": 1,
        "values": ["inicio", "nosotros", "contacto", "global"]
      },
      {
        "type": "select",
        "name": "tipo_campo",
        "required": false,
        "presentable": false,
        "maxSelect": 1,
        "values": ["texto", "parrafo", "url_imagen", "json"]
      },
      {
        "type": "autodate",
        "name": "created",
        "onCreate": true,
        "onUpdate": false
      },
      {
        "type": "autodate",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true
      }
    ]
  });

  try {
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("Collection name must be unique")) {
      console.log("page_content ya existe, omitiendo.");
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("page_content");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("page_content no existe, omitiendo revert.");
      return;
    }
    throw e;
  }
});
