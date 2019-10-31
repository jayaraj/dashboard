import React, { useState, useMemo, useContext, useRef, RefObject, memo, useEffect } from 'react';
import usePrevious from 'react-use/lib/usePrevious';
import { VariableSuggestion, VariableOrigin, DataLinkSuggestions } from './DataLinkSuggestions';
import { ThemeContext, DataLinkBuiltInVars, makeValue } from '../../index';
import { SelectionReference } from './SelectionReference';
import { Portal } from '../index';

import { Editor } from '@grafana/slate-react';
import { Value } from 'slate';
import Plain from 'slate-plain-serializer';
import { Popper as ReactPopper } from 'react-popper';
import { css, cx } from 'emotion';

import { SlatePrism } from '../../slate-plugins';
import { SCHEMA } from '../../utils/slate';
import { stylesFactory } from '../../themes';
import { GrafanaTheme } from '@grafana/data';

const modulo = (a: number, n: number) => a - n * Math.floor(a / n);

interface DataLinkInputProps {
  value: string;
  onChange: (url: string, callback?: () => void) => void;
  suggestions: VariableSuggestion[];
}

const plugins = [
  SlatePrism({
    onlyIn: (node: any) => node.type === 'code_block',
    getSyntax: () => 'links',
  }),
];

const getStyles = stylesFactory((theme: GrafanaTheme) => ({
  editor: css`
    .token.builtInVariable {
      color: ${theme.colors.queryGreen};
    }
    .token.variable {
      color: ${theme.colors.queryKeyword};
    }
  `,
}));

// This memoised also because rerendering the slate editor grabs focus which created problem in some cases this
// was used and changes to different state were propagated here.
export const DataLinkInput: React.FC<DataLinkInputProps> = memo(({ value, onChange, suggestions }) => {
  const editorRef = useRef<Editor>() as RefObject<Editor>;
  const theme = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [showingSuggestions, setShowingSuggestions] = useState(false);
  const [suggestionsIndex, setSuggestionsIndex] = useState(0);
  const [linkUrl, setLinkUrl] = useState<Value>(makeValue(value));
  const prevLinkUrl = usePrevious<Value>(linkUrl);

  // Workaround for https://github.com/ianstormtaylor/slate/issues/2927
  const stateRef = useRef({ showingSuggestions, suggestions, suggestionsIndex, linkUrl, onChange });
  stateRef.current = { showingSuggestions, suggestions, suggestionsIndex, linkUrl, onChange };

  // SelectionReference is used to position the variables suggestion relatively to current DOM selection
  const selectionRef = useMemo(() => new SelectionReference(), [setShowingSuggestions, linkUrl]);

  const onKeyDown = React.useCallback((event: KeyboardEvent, next: () => any) => {
    if (!stateRef.current.showingSuggestions) {
      if (event.key === '=' || event.key === '$' || (event.keyCode === 32 && event.ctrlKey)) {
        return setShowingSuggestions(true);
      }
      return next();
    }

    switch (event.key) {
      case 'Backspace':
      case 'Escape':
        setShowingSuggestions(false);
        return setSuggestionsIndex(0);

      case 'Enter':
        event.preventDefault();
        return onVariableSelect(stateRef.current.suggestions[stateRef.current.suggestionsIndex]);

      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        return setSuggestionsIndex(index => modulo(index + direction, stateRef.current.suggestions.length));
      default:
        return next();
    }
  }, []);

  useEffect(() => {
    // Update the state of the link in the parent. This is basically done on blur but we need to do it after
    // our state have been updated. The duplicity of state is done for perf reasons and also because local
    // state also contains things like selection and formating.
    if (prevLinkUrl && prevLinkUrl.selection.isFocused && !linkUrl.selection.isFocused) {
      stateRef.current.onChange(Plain.serialize(linkUrl));
    }
  }, [linkUrl, prevLinkUrl]);

  const onUrlChange = React.useCallback(({ value }: { value: Value }) => {
    setLinkUrl(value);
  }, []);

  const onVariableSelect = (item: VariableSuggestion, editor = editorRef.current!) => {
    const includeDollarSign = Plain.serialize(editor.value).slice(-1) !== '$';
    if (item.origin !== VariableOrigin.Template || item.value === DataLinkBuiltInVars.includeVars) {
      editor.insertText(`${includeDollarSign ? '$' : ''}\{${item.value}}`);
    } else {
      editor.insertText(`var-${item.value}=$\{${item.value}}`);
    }

    setLinkUrl(editor.value);
    setShowingSuggestions(false);

    setSuggestionsIndex(0);
    onChange(Plain.serialize(editor.value));
  };

  return (
    <div
      className={cx(
        'gf-form-input',
        css`
          position: relative;
          height: auto;
        `
      )}
    >
      <div className="slate-query-field">
        {showingSuggestions && (
          <Portal>
            <ReactPopper
              referenceElement={selectionRef}
              placement="top-end"
              modifiers={{
                preventOverflow: { enabled: true, boundariesElement: 'window' },
                arrow: { enabled: false },
                offset: { offset: 250 }, // width of the suggestions menu
              }}
            >
              {({ ref, style, placement }) => {
                return (
                  <div ref={ref} style={style} data-placement={placement}>
                    <DataLinkSuggestions
                      suggestions={stateRef.current.suggestions}
                      onSuggestionSelect={onVariableSelect}
                      onClose={() => setShowingSuggestions(false)}
                      activeIndex={suggestionsIndex}
                    />
                  </div>
                );
              }}
            </ReactPopper>
          </Portal>
        )}
        <Editor
          schema={SCHEMA}
          ref={editorRef}
          placeholder="http://your-grafana.com/d/000000010/annotations"
          value={stateRef.current.linkUrl}
          onChange={onUrlChange}
          onKeyDown={(event, _editor, next) => onKeyDown(event as KeyboardEvent, next)}
          plugins={plugins}
          className={styles.editor}
        />
      </div>
    </div>
  );
});

DataLinkInput.displayName = 'DataLinkInput';
