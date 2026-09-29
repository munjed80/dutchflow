/** One inventory for generation, approval and release checks. */
export function audioSources(lessons, practice, pronunciation) {
  const additional = [
    ...practice.map((pack) => ({ id: pack.listening.id, dutch: pack.listening.text })),
    ...pronunciation.map(({ id, dutch }) => ({ id, dutch })),
  ];
  const sources = [...lessons, { phrases: additional }];
  const ids = new Set();
  for (const phrase of sources.flatMap((source) => source.phrases)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(phrase.id) || ids.has(phrase.id) || typeof phrase.dutch !== "string" || !phrase.dutch.trim()) throw new Error("Invalid or duplicate audio source");
    ids.add(phrase.id);
  }
  return sources;
}
