import React, { CSSProperties } from 'react';
import { OnDrag, OnResize } from 'react-moveable/declaration/types';

import {
  BackgroundImageSize,
  CanvasElementItem,
  CanvasElementOptions,
  canvasElementRegistry,
} from 'app/features/canvas';
import { DimensionContext } from 'app/features/dimensions';
import { notFoundItem } from 'app/features/canvas/elements/notFound';
import { GroupState } from './group';

let counter = 100;

export class ElementState {
  readonly UID = counter++;

  revId = 0;
  sizeStyle: CSSProperties = {};
  dataStyle: CSSProperties = {};

  // Filled in by ref
  div?: HTMLDivElement;

  // Calculated
  width = 100;
  height = 100;
  data?: any; // depends on the type

  constructor(public item: CanvasElementItem, public options: CanvasElementOptions, public parent?: GroupState) {
    if (!options) {
      this.options = { type: item.id };
    }
  }

  // The parent size, need to set our own size based on offsets
  updateSize(width: number, height: number) {
    this.width = width;
    this.height = height;

    // Update the CSS position
    this.sizeStyle = {
      ...this.options.placement,
      position: 'absolute',
    };
  }

  updateData(ctx: DimensionContext) {
    if (this.item.prepareData) {
      this.data = this.item.prepareData(ctx, this.options.config);
      this.revId++; // rerender
    }

    const { background, border } = this.options;
    const css: CSSProperties = {};
    if (background) {
      if (background.color) {
        const color = ctx.getColor(background.color);
        css.backgroundColor = color.value();
      }
      if (background.image) {
        const image = ctx.getResource(background.image);
        if (image) {
          const v = image.value();
          if (v) {
            css.backgroundImage = `url("${v}")`;
            switch (background.size ?? BackgroundImageSize.Contain) {
              case BackgroundImageSize.Contain:
                css.backgroundSize = 'contain';
                css.backgroundRepeat = 'no-repeat';
                break;
              case BackgroundImageSize.Cover:
                css.backgroundSize = 'cover';
                css.backgroundRepeat = 'no-repeat';
                break;
              case BackgroundImageSize.Original:
                css.backgroundRepeat = 'no-repeat';
                break;
              case BackgroundImageSize.Tile:
                css.backgroundRepeat = 'repeat';
                break;
              case BackgroundImageSize.Fill:
                css.backgroundSize = '100% 100%';
                break;
            }
          }
        }
      }
    }

    if (border && border.color && border.width) {
      const color = ctx.getColor(border.color);
      css.borderWidth = border.width;
      css.borderStyle = 'solid';
      css.borderColor = color.value();

      // Move the image to inside the border
      if (css.backgroundImage) {
        css.backgroundOrigin = 'padding-box';
      }
    }

    this.dataStyle = css;
  }

  /** Recursively visit all nodes */
  visit(visitor: (v: ElementState) => void) {
    visitor(this);
  }

  onChange(options: CanvasElementOptions) {
    if (this.item.id !== options.type) {
      this.item = canvasElementRegistry.getIfExists(options.type) ?? notFoundItem;
    }

    this.revId++;
    this.options = { ...options };
    let trav = this.parent;
    while (trav) {
      trav.revId++;
      trav = trav.parent;
    }
  }

  getSaveModel() {
    return { ...this.options };
  }

  initElement = (target: HTMLDivElement) => {
    this.div = target;

    let placement = this.options.placement;
    if (!placement) {
      placement = {
        left: 0,
        top: 0,
      };
      this.options.placement = placement;
    }
  };

  applyDrag = (event: OnDrag) => {
    const placement = this.options.placement;
    placement!.top = event.top;
    placement!.left = event.left;

    event.target.style.top = `${event.top}px`;
    event.target.style.left = `${event.left}px`;
  };

  applyResize = (event: OnResize) => {
    const placement = this.options.placement;
    placement!.height = event.height;
    placement!.width = event.width;

    event.target.style.height = `${event.height}px`;
    event.target.style.width = `${event.width}px`;
  };

  render() {
    const { item } = this;
    return (
      <div key={`${this.UID}/${this.revId}`} style={{ ...this.sizeStyle, ...this.dataStyle }} ref={this.initElement}>
        <item.display config={this.options.config} width={this.width} height={this.height} data={this.data} />
      </div>
    );
  }
}
