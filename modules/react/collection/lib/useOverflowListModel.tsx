import React from 'react';

import {createModelHook} from '@workday/canvas-kit-react/common';
import {useSelectionListModel} from './useSelectionListModel';
import {Item} from './useBaseListModel';

export function getHiddenIds(
  containerWidth: number,
  containerGap: number,
  overflowTargetWidth: number,
  itemWidthCache: Record<string, number>,
  selectedIds: string[] | 'all',
  items: Item<any>[]
): string[] {
  /** Allows us to prioritize showing the selected item */
  let selectedKey: undefined | string;
  /** Tally of combined item widths. We'll add items that fit until the container is full */
  let itemWidth = 0;
  /** Tally ids that won't fit inside the container. These will be used by components to hide
   * elements that won't fit in the container */
  const hiddenIds: string[] = [];
  /** Track if gap should be calculated since gap doesn't apply to the width of the first item, only
   * consecutive items */
  let shouldAddGap = false;

  if (selectedIds !== 'all' && selectedIds.length) {
    if (items.length) {
      // If selectedIds[0] is not in items, use the first id from items
      selectedKey = items.find(item => item.id === selectedIds[0]) ? selectedIds[0] : items[0].id;
    }
  }

  if (
    Object.keys(itemWidthCache).reduce(
      (sum, key, index) => sum + itemWidthCache[key] + (index > 0 ? containerGap : 0),
      0
    ) <= containerWidth
  ) {
    // All items fit, return empty array
    return [];
  } else if (selectedKey) {
    if (itemWidthCache[selectedKey] + overflowTargetWidth > containerWidth) {
      // If the selected item doesn't fit, only show overflow (all items hidden)
      return Object.keys(itemWidthCache);
    } else {
      // at least the selected item and overflow target fit. Update our itemWidth with the sum
      itemWidth += itemWidthCache[selectedKey] + overflowTargetWidth;
      shouldAddGap = true;
    }
  } else {
    itemWidth += overflowTargetWidth;
  }

  for (const key in itemWidthCache) {
    if (key !== selectedKey) {
      itemWidth += itemWidthCache[key] + (shouldAddGap ? containerGap : 0);
      shouldAddGap = true;
      if (itemWidth > containerWidth) {
        hiddenIds.push(key);
      }
    }
  }

  return hiddenIds;
}

export const useOverflowListModel = createModelHook({
  defaultConfig: {
    ...useSelectionListModel.defaultConfig,
    initialHiddenIds: [] as string[],
    containerWidth: 0,
    /**
     * Determines if overflow should actually occur. For example, touch devices are better at
     * side-scrolling than mouse devices. In these cases, it makes sense to disable overflowing.
     * @default true
     */ shouldCalculateOverflow: true,
  },
  requiredConfig: useSelectionListModel.requiredConfig,
  contextOverride: useSelectionListModel.Context,
})(config => {
  const shouldCalculateOverflow =
    config.shouldCalculateOverflow === undefined ? true : config.shouldCalculateOverflow;
  const [hiddenIds, setHiddenIds] = React.useState(config.initialHiddenIds);
  const [itemWidthCache, setItemWidthCache] = React.useState<Record<string, number>>({});
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [containerGap, setContainerGap] = React.useState(0);
  const containerWidthRef = React.useRef(0);
  const itemWidthCacheRef = React.useRef(itemWidthCache);
  const [overflowTargetWidth, setOverflowTargetWidth] = React.useState(0);
  const overflowTargetWidthRef = React.useRef(0);

  const internalHiddenIds = shouldCalculateOverflow ? hiddenIds : [];

  // Cursors skip over disabled ids, but know nothing of hidden ids. We'll go ahead and disable
  // hidden ids as well
  const nonInteractiveIds = (config.nonInteractiveIds || []).concat(internalHiddenIds);

  const model = useSelectionListModel({
    ...config,
    nonInteractiveIds,
  });

  const state = {
    ...model.state,
    hiddenIds: internalHiddenIds,
    itemWidthCache,
    containerWidth,
    containerGap,
    overflowTargetWidth,
  };

  const events = {
    ...model.events,
    select(data: Parameters<typeof model.events.select>[0]) {
      const {selectedIds} = model.selection.select(data.id, state);
      const ids = getHiddenIds(
        containerWidthRef.current,
        containerGap,
        overflowTargetWidthRef.current,
        itemWidthCacheRef.current,
        selectedIds,
        config.items
      );
      model.events.select(data);

      setHiddenIds(ids);
    },
    setContainerWidth(data: {width?: number}) {
      containerWidthRef.current = data.width || 0;
      setContainerWidth(data.width || 0);

      const ids = getHiddenIds(
        containerWidthRef.current,
        containerGap,
        overflowTargetWidthRef.current,
        itemWidthCacheRef.current,
        state.selectedIds,
        config.items
      );

      setHiddenIds(ids);
    },
    setContainerGap(data: {size: number}) {
      setContainerGap(data.size);

      const ids = getHiddenIds(
        containerWidthRef.current,
        data.size,
        overflowTargetWidthRef.current,
        itemWidthCacheRef.current,
        state.selectedIds,
        config.items
      );

      setHiddenIds(ids);
    },
    setOverflowTargetWidth(data: {width: number}) {
      overflowTargetWidthRef.current = data.width;
      setOverflowTargetWidth(data.width);
    },
    addItemWidth(data: {id: string; width: number}) {
      itemWidthCacheRef.current = {
        ...itemWidthCacheRef.current,
        [data.id]: data.width,
      };

      setItemWidthCache(itemWidthCacheRef.current);

      const ids = getHiddenIds(
        containerWidthRef.current,
        containerGap,
        overflowTargetWidthRef.current,
        itemWidthCacheRef.current,
        state.selectedIds,
        config.items
      );

      setHiddenIds(ids);
    },
    removeItemWidth(data: {id: string}) {
      const newCache = {...itemWidthCacheRef.current};
      delete newCache[data.id];
      itemWidthCacheRef.current = newCache;
      setItemWidthCache(itemWidthCacheRef.current);

      const ids = getHiddenIds(
        containerWidthRef.current,
        containerGap,
        overflowTargetWidthRef.current,
        itemWidthCacheRef.current,
        state.selectedIds !== 'all'
          ? state.selectedIds.filter(sId => data.id !== sId)
          : state.selectedIds,
        config.items
      );

      setHiddenIds(ids);
    },
    addHiddenKey(data: {id: string}) {
      setHiddenIds(ids => ids.concat(data.id));
    },
    removeHiddenKey(data: {id: string}) {
      setHiddenIds(ids => ids.filter(key => key !== data.id));
    },
  };

  return {...model, state, events};
});
