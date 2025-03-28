export interface IBaseRace {
  lapCount: number;
  lapTotal: number;
  endedAt: number;
  entries: number;
  id: number;
  prize: string;
  startedAt: number;
  winner: number;
  isMinting: boolean;
  isLive: boolean;
  isFinished: boolean;
  isEnded: boolean;
}

export class BaseRace implements IBaseRace {
  lapCount: number;
  lapTotal: number;
  endedAt: number;
  entries: number;
  id: number;
  prize: string;
  startedAt: number;
  winner: number;

  constructor(
    id: number,
    entries: number,
    startedAt: number,
    endedAt: number,
    lapTotal: number,
    lapCount: number,
    prize: string,
    winner: number,
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

  static fromContractResult(id: number, result: any[]): BaseRace {
    return new BaseRace(
      id,
      Number(result[0].toString()),
      Number(result[1].toString()),
      Number(result[2].toString()),
      Number(result[3].toString()),
      Number(result[4].toString()),
      result[5].toString(),
      result[6].toString(),
    );
  }

  // Convert class instance to plain object
  toJSON(): IBaseRace {
    return {
      id: this.id,
      entries: this.entries,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      lapTotal: this.lapTotal,
      lapCount: this.lapCount,
      prize: this.prize,
      winner: this.winner,
      isMinting: this.isMinting,
      isLive: this.isLive,
      isFinished: this.isFinished,
      isEnded: this.isEnded,
    };
  }

  // Create class instance from plain object
  static fromJSON(data: IBaseRace): BaseRace {
    return new BaseRace(
      data.id,
      data.entries,
      data.startedAt,
      data.endedAt,
      data.lapTotal,
      data.lapCount,
      data.prize,
      data.winner,
    );
  }

  get isMinting(): boolean {
    return this.startedAt > 0 && this.endedAt === 0 && this.lapCount === 0;
  }

  // Race is live
  get isLive(): boolean {
    return this.startedAt > 0 && this.endedAt === 0 && this.lapCount > 0;
  }

  // Race has ended but the winner is not yet set
  get isEnded(): boolean {
    return (
      this.startedAt > 0 &&
      this.endedAt > 0 &&
      this.winner === 0 &&
      this.lapCount === this.lapTotal
    );
  }

  // Race has ended and the winner is set
  get isFinished(): boolean {
    return (
      this.startedAt > 0 &&
      this.endedAt > 0 &&
      this.winner !== 0 &&
      this.lapCount === this.lapTotal
    );
  }
}
