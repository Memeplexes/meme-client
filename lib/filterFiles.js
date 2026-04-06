export function filterFiles(files, query) {
  const normalizedQuery = query.trim().toLowerCase();
  const queryTags = normalizedQuery.split(/\s+/).filter(Boolean);

  if (!queryTags.length) {
    return files;
  }

  return files.filter(file => {
    const normalizedFile = (typeof file === "string" ? file : file.filename || "").toLowerCase();
    return queryTags.every(tag => normalizedFile.includes(tag));
  });
}
