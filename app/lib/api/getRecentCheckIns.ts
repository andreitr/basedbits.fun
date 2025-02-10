const INDEX_SUPPLY_PATH = `https://api.indexsupply.net/query?query=select+%0A++sender%2C+%0A++timestamp%0Afrom+checkin%0Awhere+address+%3D+${process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS}%0Aorder+by+2+desc+limit+100%3B&event_signatures=CheckIn%28address+indexed+sender%2C+uint256+timestamp%2C+uint16+streak%2C+uint16+totalCheckIns%29&chain=8453`;

export const getRecentCheckIns = async (sinceHours: number = 24) => {
  const json = await fetch(INDEX_SUPPLY_PATH, {
    next: { revalidate: 60, tags: ["checkins"] },
  }).then((res) => res.json());
  return filterRecentUniqueEvents(json.result[0], sinceHours);
};

function filterRecentUniqueEvents(events: any[], sinceHours: number): string[] {
  const currentTime = Math.floor(Date.now() / 1000);
  const sinceSeconds = sinceHours * 60 * 60;
  const uniqueAddresses: Set<string> = new Set();

  for (const event of events.slice(1)) {
    const [sender, timestamp] = event;
    if (currentTime - parseInt(timestamp) <= sinceSeconds) {
      uniqueAddresses.add(sender);
    }
  }

  return Array.from(uniqueAddresses);
}
