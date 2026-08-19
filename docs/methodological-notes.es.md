# Notas metodológicas y limitaciones

## Esto no es una revisión sistemática por sí sola

La herramienta organiza un corpus ya reunido. No reemplaza un protocolo de búsqueda, criterios de inclusión, evaluación de sesgo ni registro de decisiones de exclusión.

## Los mapas reflejan decisiones

Toda visualización depende de la pregunta, del libro de códigos y de las decisiones de clasificación. Los núcleos no deben presentarse como propiedades naturales de la literatura.

## Texto y teoría no son equivalentes

La similitud en títulos o resúmenes puede ayudar a descubrir vocabularios compartidos, pero no demuestra pertenencia a una misma tradición teórica.

### Qué representa el cluster local

La aplicación genera una representación TF-IDF y agrupa referencias por similitud coseno. Por tanto, dos artículos pueden quedar próximos porque comparten terminología, población, instrumento o contexto, incluso cuando sostienen explicaciones distintas. Los clusters deben utilizarse como ayuda para explorar y ordenar el corpus, no como resultado sustantivo definitivo.

El número de clusters se propone en función del tamaño de la biblioteca y está limitado para conservar legibilidad. Esta regla es operacional, no una estimación del número verdadero de temas. Bibliotecas pequeñas, multilingües o con muchos registros sin resumen requieren mayor revisión humana.

## Ausencia de resumen

Un registro sin resumen puede aparecer en la visualización descriptiva. No debería recibir una clasificación sustantiva estable sin revisar el texto completo.

## Asociación y causalidad

Los diagramas representan relaciones analíticas, no efectos causales. La interpretación debe apoyarse en el diseño de cada estudio.

## Actualización

Para actualizar una biblioteca, exporta nuevamente desde Zotero y conserva `coding.csv`. La unión por `Key` preservará la codificación de referencias existentes.
