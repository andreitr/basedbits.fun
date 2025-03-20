export class BaseRace {
  lapCount: number;
  lapTotal: number;
  endedAt: number;
  entries: number;
  id: number;
  prize: string;
  startedAt: number;
  winner: string;

  constructor(
    id: number,
    entries: number,
    startedAt: number,
    endedAt: number,
    lapTotal: number,
    lapCount: number,
    prize: string,
    winner: string,
  ) {
    this.id = id;
    this.entries = entries;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.lapTotal = lapTotal;
    this.lapCount = lapCount;
    this.prize = prize;
    this.winner = winner;
  }

  static fromContractResult(race: number, result: any[]): BaseRace {
    return new BaseRace(
      race,
      Number(result[0].toString()),
      Number(result[1].toString()),
      Number(result[2].toString()),
      Number(result[3].toString()),
      Number(result[4].toString()),
      result[5].toString(),
      result[6].toString(),
    );
  }

  get isMinting(): boolean {
    return this.startedAt > 0 && this.endedAt === 0 && this.lapCount === 0;
  }

  get isLive(): boolean {
    return this.startedAt > 0 && this.endedAt === 0 && this.lapCount > 0;
  }

  get isFinished(): boolean {
    return this.startedAt > 0 && this.endedAt > 0;
  }
}
