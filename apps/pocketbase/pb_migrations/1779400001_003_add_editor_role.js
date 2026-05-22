/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");

  const existing = collection.fields.getByName("role");
  if (existing && existing.type === "select") {
    existing.values = ["buyer", "seller", "editor", "admin"];
    return app.save(collection);
  }

  if (existing) collection.fields.removeByName("role");

  collection.fields.add(new SelectField({
    name: "role",
    required: false,
    values: ["buyer", "seller", "editor", "admin"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  const existing = collection.fields.getByName("role");
  if (existing && existing.type === "select") {
    existing.values = ["buyer", "seller", "admin"];
    return app.save(collection);
  }
});
