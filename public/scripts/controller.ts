import { AntDTO } from "../../types/ant.ts";
import { Direction } from "../../types/general.ts";
import { EventBus } from "./event-bus.ts";
import { GameStore } from "./game-store.ts";

export class Controller {
  protected _selectedAnt: AntDTO | null = null;
  constructor(protected bus: EventBus, protected gameStore: GameStore) {
    bus.once("gameStoreInitialized", () => {
      this.selectAnyAnt();
    });
  }

  protected get selectedAnt(): Controller["_selectedAnt"] {
    return this._selectedAnt;
  }

  protected set selectedAnt(newAnt: AntDTO) {
    const ants = this.gameStore.getAntsOfPlayer();
    const isValid = ants.find((a) => a.id === newAnt.id);
    //todo: what if there is an ant with an id of null?
    if (isValid) this._selectedAnt = newAnt;
    else if (ants.length) this._selectedAnt = ants[0];
    else return;
    this.bus.emit("rendererSelectAnt", this._selectedAnt);
  }

  protected selectAnyAnt() {
    const ants = this.gameStore.getAntsOfPlayer();
    if (!ants.length) throw new Error("[Error] No ant available");
    this.selectedAnt = ants[0];
  }

  init() {
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));
  }

  dispose() {
  }

  protected handleKeyPress(e: KeyboardEvent) {
    e.preventDefault();
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
        this.sendMoveEvent("w");
        break;
      }
      case "ArrowRight": {
        this.sendMoveEvent("e");
        break;
      }
      case "ArrowUp": {
        this.sendMoveEvent("n");
        break;
      }
      case "ArrowDown": {
        this.sendMoveEvent("s");
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

  protected sendMoveEvent(direction: Direction, id = this.selectedAnt?.id) {
    if (!id) return;
    this.bus.emit("gameMoveAnt", { id, direction });
  }

  protected cycleAntSelection(direction: 1 | -1) {
    const ants = this.gameStore.getAntsOfPlayer();

    const currentIndex = ants.findIndex((a) => a.id === this.selectedAnt?.id);

    let nextIndex = 0;

    if (currentIndex === -1) {
      nextIndex = 0;
    } else {
      nextIndex = (currentIndex + direction + ants.length) % ants.length;
    }

    this.selectedAnt = ants[nextIndex];
  }
}
