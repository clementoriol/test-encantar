import references from "./references.json";

export const loadReferences = async () => {
  const referencesList = references.map((reference) => {
    return {
      ...reference,
      image: new Image(),
    };
  });

  await Promise.all(
    referencesList.map((reference) => {
      return new Promise<void>((resolve) => {
        reference.image.onload = () => resolve();
        reference.image.src = reference.url;
      });
    })
  );

  return referencesList;
};
