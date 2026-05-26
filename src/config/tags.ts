/**
 * Configuration centralisée des tags de documents
 * À modifier ici si vous ajoutez/enlevez/modifiez les tags
 */

export interface TagConfig {
  value: string;
  label: string;
  emoji: string;
}

export const DOCUMENT_TAGS: TagConfig[] = [
  {
    value: 'TUTORIEL',
    label: 'Tutoriel',
    emoji: '📚'
  },
  {
    value: 'GUIDE',
    label: 'Guide',
    emoji: '📖'
  },
  {
    value: 'LETTRE',
    label: 'Lettre',
    emoji: '📮'
  },
  {
    value: 'RAPPORT',
    label: 'Rapport',
    emoji: '📊'
  }
];

/**
 * Formate un tag pour l'affichage
 * @param tagValue - La valeur brute du tag (ex: "TUTORIEL")
 * @returns Le tag formaté avec emoji (ex: "📚 Tutoriel")
 */
export const formatTag = (tagValue: string): string => {
  const tagConfig = DOCUMENT_TAGS.find(t => t.value === tagValue);
  return tagConfig ? `${tagConfig.emoji} ${tagConfig.label}` : tagValue;
};

/**
 * Récupère la liste des valeurs de tags valides
 * @returns Array des valeurs de tags (ex: ["TUTORIEL", "GUIDE", "LETTRE"])
 */
export const getValidTagValues = (): string[] => {
  return DOCUMENT_TAGS.map(t => t.value);
};
