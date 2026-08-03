let commissionDraft = {
  photoData: null,
  order: null,
};

export function getCommissionDraft() {
  return commissionDraft;
}

export function setCommissionPhoto(photoData) {
  commissionDraft = { ...commissionDraft, photoData };
}

export function setCommissionOrder(order) {
  commissionDraft = { ...commissionDraft, order };
}

export function clearCommissionDraft() {
  commissionDraft = { photoData: null, order: null };
}
