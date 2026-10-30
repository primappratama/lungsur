const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number) {
  return rupiah.format(value);
}

export const CONDITION_LABEL = {
  like_new: "mulus",
  used: "minus pemakaian",
  defect: "ada cacat",
} as const;
