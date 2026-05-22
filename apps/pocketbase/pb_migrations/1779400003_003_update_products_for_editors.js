/// <reference path="../pb_data/types.d.ts" />
// Permite que editors y admins gestionen cualquier producto,
// y actualiza categorías a las de la Orinoquía.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");

  // Permisos: sellers editan los suyos; editors y admins editan cualquiera
  collection.updateRule = "vendorId = @request.auth.id || @request.auth.role = 'editor' || @request.auth.role = 'admin'";
  collection.deleteRule = "vendorId = @request.auth.id || @request.auth.role = 'editor' || @request.auth.role = 'admin'";
  collection.createRule = "@request.auth.id != ''";

  // Actualizar categorías al catálogo real de la Orinoquía
  const categoryField = collection.fields.getByName("category");
  if (categoryField && categoryField.type === "select") {
    categoryField.values = [
      "Frutas Tropicales",
      "Hortalizas y Verduras",
      "Plátano y Yuca",
      "Ganadería y Cárnicos",
      "Lácteos y Derivados",
      "Pescados de Río",
      "Miel y Apicultura",
      "Granos y Cereales",
      "Artesanías Llaneras",
      "Insumos Agropecuarios",
      "Productos Transformados"
    ];
  }

  // Actualizar ubicaciones con municipios del Vichada
  const locationField = collection.fields.getByName("location");
  if (locationField && locationField.type === "select") {
    locationField.values = [
      "Puerto Carreño",
      "Cumaribo",
      "La Primavera",
      "Santa Rosalía",
      "Regional"
    ];
  }

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.updateRule = "vendorId = @request.auth.id";
  collection.deleteRule = "vendorId = @request.auth.id";
  return app.save(collection);
});
