import { Client } from "./client.ts";
import { Controller } from "./controller.ts";
import { EventBus } from "./event-bus.ts";
import { GameStore } from "./game-store.ts";
import { Renderer } from "./renderer.ts";

function main() {
  const eventBus = new EventBus();

  const client = new Client(eventBus);
  const gameStore = new GameStore(eventBus);
  const renderer = new Renderer(eventBus, gameStore);
  const controller = new Controller(eventBus, gameStore);

  client.init();
  renderer.init();
  controller.init();

  window["ants"] = { client, gameStore, renderer, controller, eventBus };
}

document.addEventListener("DOMContentLoaded", main);
