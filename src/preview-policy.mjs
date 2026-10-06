export const MAX_PREVIEW_FACES=4000000;
export function previewFaceLimit(desktop=false){return desktop?MAX_PREVIEW_FACES:2000000;}
