const INDEX_SUPPLY_PATH = `https://api.indexsupply.net/query?query=select+%0A++sender%2C+%0A++timestamp%0Afrom+checkin%0Awhere+address+%3D+${process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS}%0Aorder+by+2+desc+limit+100%3B&event_signatures=CheckIn%28address+indexed+sender%2C+uint256+timestamp%29&event_signatures=&chain=8453&network=mainnet&variables=%7B%7D`;

export const getRecentCheckIns = async () => {
  const json = await fetch(INDEX_SUPPLY_PATH, {
    next: { revalidate: 60 },
  }).then((res) => res.json());
  return filterRecentUniqueEvents(json.result[0]);
};

function filterRecentUniqueEvents(events: any[]): string[] {
  const currentTime = Math.floor(Date.now() / 1000);
  const oneDayInSeconds = 24 * 60 * 60;
  const uniqueAddresses: Set<string> = new Set();

  for (const event of events.slice(1)) {
    const [sender, timestamp] = event;
    if (currentTime - parseInt(timestamp) <= oneDayInSeconds) {
      uniqueAddresses.add(sender);
    }
  }

  return Array.from(uniqueAddresses);
}
