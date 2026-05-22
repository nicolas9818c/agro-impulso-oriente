import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

/**
 * Carga un bloque de contenido editable de PocketBase.
 * Si no existe el registro, devuelve el valor por defecto.
 *
 * @param {string}  clave        - Clave única del bloque (ej: "home.hero.title")
 * @param {string}  defaultValue - Valor por defecto si no hay registro en PB
 * @returns {{ value: string, loading: boolean }}
 */
export function usePageContent(clave, defaultValue = '') {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const records = await pb.collection('page_content').getList(1, 1, {
          filter: `clave = "${clave}"`,
          $autoCancel: false,
        });
        if (!cancelled && records.items.length > 0) {
          setValue(records.items[0].valor ?? defaultValue);
        }
      } catch {
        // PocketBase no disponible o colección no existe → usa default
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [clave]);

  return { value, loading };
}

/**
 * Carga todos los registros de page_content de una sección.
 * Devuelve un mapa { clave: valor } para acceso rápido.
 *
 * @param {string} seccion - "inicio" | "nosotros" | "contacto" | "global"
 * @returns {{ content: Record<string,string>, records: object[], loading: boolean }}
 */
export function useSectionContent(seccion) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await pb.collection('page_content').getList(1, 200, {
          filter: `seccion = "${seccion}"`,
          sort:   'etiqueta',
          $autoCancel: false,
        });
        if (!cancelled) setRecords(result.items);
      } catch {
        // PocketBase no disponible → lista vacía
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [seccion]);

  const content = records.reduce((acc, r) => {
    acc[r.clave] = r.valor ?? '';
    return acc;
  }, {});

  return { content, records, loading, setRecords };
}
