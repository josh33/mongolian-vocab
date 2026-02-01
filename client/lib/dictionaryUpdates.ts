import { PACKS } from "@/data/packs/manifest";
import { getAcceptedPacks, getDismissedPacks } from "@/lib/storage";

export async function getPendingPackCount(): Promise<number> {
  const [accepted, dismissed] = await Promise.all([
    getAcceptedPacks(),
    getDismissedPacks(),
  ]);

  let pending = 0;

  for (const pack of PACKS) {
    const acceptedPack = accepted.find((a) => a.id === pack.id);
    if (acceptedPack) {
      if (acceptedPack.version < pack.version) pending += 1;
      continue;
    }

    const dismissedPack = dismissed.find((d) => d.id === pack.id);

    if (dismissedPack && dismissedPack.version === pack.version) {
      continue;
    }

    pending += 1;
  }

  return pending;
}
