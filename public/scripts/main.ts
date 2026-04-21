import { Client } from "./client.ts";
import { Controller } from "./controller.ts";
import { EventBus } from "./event-bus.ts";
import { GameStore } from "./game-store.ts";
import { Renderer } from "./renderer.ts";

function main() {
  const eventBus = new EventBus();

  const client = new Client(eventBus);
  const game = new GameStore(eventBus);
  const renderer = new Renderer(eventBus, game);
  const controller = new Controller(eventBus, game);

  client.connect();
  renderer.render();
  controller.mount();
}

document.addEventListener("DOMContentLoaded", main);
