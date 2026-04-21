import { EventBus } from "./event-bus.ts";
import { GameStore } from "./game-store.ts";

export class Controller {
  private selectedAntId: string | null = null;
  constructor(protected bus: EventBus, protected gameStore: GameStore) {
  }

  mount() {
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));
  }

  dispose() {
  }

  protected handleKeyPress(e: KeyboardEvent) {
    console.log("e.key --->", e.key);
    switch (e.key) {
      case "a": {
        console.log(this.gameStore.getEntitiesOfPlayer(this.gameStore.getPlayerId()));
      }
    }
  }
}
