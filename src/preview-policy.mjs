export const MAX_PREVIEW_FACES=4000000;
export function previewFaceLimit(desktop=false,phone=false){return phone?250000:desktop?MAX_PREVIEW_FACES:2000000;}
