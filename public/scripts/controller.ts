import { EventBus } from "./event-bus.ts";
import { GameStore } from "./game-store.ts";

export class Controller {
  protected selectedAntId: string | null = null;
  constructor(protected bus: EventBus, protected gameStore: GameStore) {
  }

  init() {
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));
  }

  dispose() {
  }

  protected handleKeyPress(e: KeyboardEvent) {
    console.log("e.key --->", e.key);
    switch (e.key) {
      case "d": {
        this.cycleAntSelection(1);
        break;
      }
      case "a": {
        this.cycleAntSelection(-1);
        break;
      }
      case "ArrowLeft": {
        if (!this.selectedAntId) break;
        this.bus.emit("gameMoveAnt", { id: this.selectedAntId, direction: "w" });
        break;
      }
      case "ArrowRight": {
        if (!this.selectedAntId) break;
        this.bus.emit("gameMoveAnt", { id: this.selectedAntId, direction: "e" });

        break;
      }
      case "ArrowUp": {
        if (!this.selectedAntId) break;
        this.bus.emit("gameMoveAnt", { id: this.selectedAntId, direction: "n" });

        break;
      }
      case "ArrowDown": {
        if (!this.selectedAntId) break;
        this.bus.emit("gameMoveAnt", { id: this.selectedAntId, direction: "s" });

        break;
      }
      case "Escape": {
        debugger;
        break;
      }
      default: {
        break;
      }
    }
  }

  cycleAntSelection(direction: 1 | -1) {
    const ants = this.gameStore.getAntsOfPlayer();

    const currentIndex = ants.findIndex((a) => a.id === this.selectedAntId);

    let nextIndex = 0;

    if (currentIndex === -1) {
      nextIndex = 0;
    } else {
      nextIndex = (currentIndex + direction + ants.length) % ants.length;
    }

    this.selectedAntId = ants[nextIndex].id;
  }
}
