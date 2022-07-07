import { useEffect } from 'react';
import { useObservable } from 'react-use';
import { Observer, Subject, Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { EventBusSrv } from '@grafana/data';

import { SceneComponentEditWrapper } from './SceneComponentEditWrapper';
import { SceneObjectStateChangedEvent } from './events';
import {
  SceneDataState,
  SceneObject,
  SceneLayoutState,
  SceneObjectState,
  SceneComponent,
  SceneEditor,
  SceneObjectList,
  SceneTimeRange,
} from './types';

export abstract class SceneObjectBase<TState extends SceneObjectState = {}> implements SceneObject<TState> {
  subject = new Subject<TState>();
  state: TState;
  parent?: SceneObjectBase<any>;
  subs = new Subscription();
  isMounted?: boolean;
  events = new EventBusSrv();

  constructor(state: TState) {
    if (!state.key) {
      state.key = uuidv4();
    }

    this.state = state;
    this.subject.next(state);
    this.setParent();
  }

  /**
   * Used in render functions when rendering a SceneObject.
   * Wraps the component in an EditWrapper that handles edit mode
   */
  get Component(): SceneComponent<this> {
    return SceneComponentEditWrapper;
  }

  /**
   * Temporary solution, should be replaced by declarative options
   */
  get Editor(): SceneComponent<this> {
    return ((this as any).constructor['Editor'] ?? (() => null)) as SceneComponent<this>;
  }

  private setParent() {
    for (const propValue of Object.values(this.state)) {
      if (propValue instanceof SceneObjectBase) {
        propValue.parent = this;
      }

      if (Array.isArray(propValue)) {
        for (const child of propValue) {
          if (child instanceof SceneObjectBase) {
            child.parent = this;
          }
        }
      }
    }
  }

  /** This function implements the Subscribable<TState> interface */
  subscribe(observer: Partial<Observer<TState>>) {
    return this.subject.subscribe(observer);
  }

  setState(update: Partial<TState>) {
    const prevState = this.state;
    this.state = {
      ...this.state,
      ...update,
    };
    this.setParent();
    this.subject.next(this.state);

    // broadcast state change. This is event is subscribed to by UrlSyncManager and UndoManager
    this.getRoot().events.publish(
      new SceneObjectStateChangedEvent({
        prevState,
        newState: this.state,
        partialUpdate: update,
        changedObject: this,
      })
    );
  }

  private getRoot(): SceneObject {
    return !this.parent ? this : this.parent.getRoot();
  }

  onMount() {
    this.isMounted = true;

    const { $data } = this.state;
    if ($data && !$data.isMounted) {
      $data.onMount();
    }
  }

  onUnmount() {
    this.isMounted = false;

    const { $data } = this.state;
    if ($data && $data.isMounted) {
      $data.onUnmount();
    }

    this.subs.unsubscribe();
    this.subs = new Subscription();
  }

  /**
   * The scene object needs to know when the react component is mounted to trigger query and other lazy actions
   */
  useMount() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!this.isMounted) {
        this.onMount();
      }
      return () => {
        if (this.isMounted) {
          this.onUnmount();
        }
      };
    }, []);

    return this;
  }

  useState() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useObservable(this.subject, this.state);
  }

  /**
   * Will walk up the scene object graph to the closest $timeRange scene object
   */
  getTimeRange(): SceneTimeRange {
    const { $timeRange } = this.state;
    if ($timeRange) {
      return $timeRange;
    }

    if (this.parent) {
      return this.parent.getTimeRange();
    }

    throw new Error('No time range found in scene tree');
  }

  /**
   * Will walk up the scene object graph to the closest $data scene object
   */
  getData(): SceneObject<SceneDataState> {
    const { $data } = this.state;
    if ($data) {
      return $data;
    }

    if (this.parent) {
      return this.parent.getData();
    }

    throw new Error('No data found in scene tree');
  }

  /**
   * Will walk up the scene object graph to the closest $editor scene object
   */
  getSceneEditor(): SceneEditor {
    const { $editor } = this.state;
    if ($editor) {
      return $editor;
    }

    if (this.parent) {
      return this.parent.getSceneEditor();
    }

    throw new Error('No editor found in scene tree');
  }

  /**
   * Will create new SceneItem with shalled cloned state, but all states items of type SceneItem are deep cloned
   */
  clone(withState?: Partial<TState>): this {
    const clonedState = { ...this.state };

    // Clone any SceneItems in state
    for (const key in clonedState) {
      const propValue = clonedState[key];
      if (propValue instanceof SceneObjectBase) {
        clonedState[key] = propValue.clone();
      }
    }

    // Clone layout children
    const layout = this.state as any as SceneLayoutState;
    if (layout.children) {
      const newChildren: SceneObjectList = [];
      for (const child of layout.children) {
        newChildren.push(child.clone());
      }
      (clonedState as any).children = newChildren;
    }

    Object.assign(clonedState, withState);

    return new (this.constructor as any)(clonedState);
  }
}
