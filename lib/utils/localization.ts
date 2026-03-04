
export type Language = 'en';

export function getLocalizedValue(value: any, lang: string = 'en'): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        return value.en || value.hi || value.ne || value.mr || value.ta || '';
    }
    return String(value);
}

export function localizeEntity(entity: any, fields: string[], lang: string = 'en'): any {
    if (!entity) return entity;
    const localized = { ...entity };
    fields.forEach(field => {
        if (localized[field]) {
            localized[field] = getLocalizedValue(localized[field], 'en');
        }
    });
    return localized;
}
