import mitt from 'mitt';

type Events = {
  'toggle-mobile-sidebar': void;
  'close-mobile-sidebar': void;
};

export const eventEmitter = mitt<Events>();
