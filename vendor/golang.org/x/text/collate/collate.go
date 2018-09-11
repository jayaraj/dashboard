// Copyright 2012 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// TODO: remove hard-coded versions when we have implemented fractional weights.
// The current implementation is incompatible with later CLDR versions.
//go:generate go run maketables.go -cldr=23 -unicode=6.2.0

// Package collate contains types for comparing and sorting Unicode strings
// according to a given collation order.
package collate // import "golang.org/x/text/collate"

import (
	"bytes"
	"strings"

	"golang.org/x/text/internal/colltab"
	"golang.org/x/text/language"
)

// Collator provides functionality for comparing strings for a given
// collation order.
type Collator struct {
	options

	sorter sorter

	_iter [2]iter
}

func (c *Collator) iter(i int) *iter {
	// TODO: evaluate performance for making the second iterator optional.
	return &c._iter[i]
}

// Supported returns the list of languages for which collating differs from its parent.
func Supported() []language.Tag {
	// TODO: use language.Coverage instead.

	t := make([]language.Tag, len(tags))
	copy(t, tags)
	return t
}

func init() {
	ids := strings.Split(availableLocales, ",")
	tags = make([]language.Tag, len(ids))
	for i, s := range ids {
		tags[i] = language.Raw.MustParse(s)
	}
}

var tags []language.Tag

// New returns a new Collator initialized for the given locale.
func New(t language.Tag, o ...Option) *Collator {
	index := colltab.MatchLang(t, tags)
	c := newCollator(getTable(locales[index]))

	// Set options from the user-supplied tag.
	c.setFromTag(t)

	// Set the user-supplied options.
	c.setOptions(o)

	c.init()
	return c
}

// NewFromTable returns a new Collator for the given Weighter.
func NewFromTable(w colltab.Weighter, o ...Option) *Collator {
	c := newCollator(w)
	c.setOptions(o)
	c.init()
	return c
}

func (c *Collator) init() {
	if c.numeric {
		c.t = colltab.NewNumericWeighter(c.t)
	}
	c._iter[0].init(c)
	c._iter[1].init(c)
}

// Buffer holds keys generated by Key and KeyString.
type Buffer struct {
	buf [4096]byte
	key []byte
}

func (b *Buffer) init() {
	if b.key == nil {
		b.key = b.buf[:0]
	}
}

// Reset clears the buffer from previous results generated by Key and KeyString.
func (b *Buffer) Reset() {
	b.key = b.key[:0]
}

// Compare returns an integer comparing the two byte slices.
// The result will be 0 if a==b, -1 if a < b, and +1 if a > b.
func (c *Collator) Compare(a, b []byte) int {
	// TODO: skip identical prefixes once we have a fast way to detect if a rune is
	// part of a contraction. This would lead to roughly a 10% speedup for the colcmp regtest.
	c.iter(0).SetInput(a)
	c.iter(1).SetInput(b)
	if res := c.compare(); res != 0 {
		return res
	}
	if !c.ignore[colltab.Identity] {
		return bytes.Compare(a, b)
	}
	return 0
}

// CompareString returns an integer comparing the two strings.
// The result will be 0 if a==b, -1 if a < b, and +1 if a > b.
func (c *Collator) CompareString(a, b string) int {
	// TODO: skip identical prefixes once we have a fast way to detect if a rune is
	// part of a contraction. This would lead to roughly a 10% speedup for the colcmp regtest.
	c.iter(0).SetInputString(a)
	c.iter(1).SetInputString(b)
	if res := c.compare(); res != 0 {
		return res
	}
	if !c.ignore[colltab.Identity] {
		if a < b {
			return -1
		} else if a > b {
			return 1
		}
	}
	return 0
}

func compareLevel(f func(i *iter) int, a, b *iter) int {
	a.pce = 0
	b.pce = 0
	for {
		va := f(a)
		vb := f(b)
		if va != vb {
			if va < vb {
				return -1
			}
			return 1
		} else if va == 0 {
			break
		}
	}
	return 0
}

func (c *Collator) compare() int {
	ia, ib := c.iter(0), c.iter(1)
	// Process primary level
	if c.alternate != altShifted {
		// TODO: implement script reordering
		if res := compareLevel((*iter).nextPrimary, ia, ib); res != 0 {
			return res
		}
	} else {
		// TODO: handle shifted
	}
	if !c.ignore[colltab.Secondary] {
		f := (*iter).nextSecondary
		if c.backwards {
			f = (*iter).prevSecondary
		}
		if res := compareLevel(f, ia, ib); res != 0 {
			return res
		}
	}
	// TODO: special case handling (Danish?)
	if !c.ignore[colltab.Tertiary] || c.caseLevel {
		if res := compareLevel((*iter).nextTertiary, ia, ib); res != 0 {
			return res
		}
		if !c.ignore[colltab.Quaternary] {
			if res := compareLevel((*iter).nextQuaternary, ia, ib); res != 0 {
				return res
			}
		}
	}
	return 0
}

// Key returns the collation key for str.
// Passing the buffer buf may avoid memory allocations.
// The returned slice will point to an allocation in Buffer and will remain
// valid until the next call to buf.Reset().
func (c *Collator) Key(buf *Buffer, str []byte) []byte {
	// See http://www.unicode.org/reports/tr10/#Main_Algorithm for more details.
	buf.init()
	return c.key(buf, c.getColElems(str))
}

// KeyFromString returns the collation key for str.
// Passing the buffer buf may avoid memory allocations.
// The returned slice will point to an allocation in Buffer and will retain
// valid until the next call to buf.ResetKeys().
func (c *Collator) KeyFromString(buf *Buffer, str string) []byte {
	// See http://www.unicode.org/reports/tr10/#Main_Algorithm for more details.
	buf.init()
	return c.key(buf, c.getColElemsString(str))
}

func (c *Collator) key(buf *Buffer, w []colltab.Elem) []byte {
	processWeights(c.alternate, c.t.Top(), w)
	kn := len(buf.key)
	c.keyFromElems(buf, w)
	return buf.key[kn:]
}

func (c *Collator) getColElems(str []byte) []colltab.Elem {
	i := c.iter(0)
	i.SetInput(str)
	for i.Next() {
	}
	return i.Elems
}

func (c *Collator) getColElemsString(str string) []colltab.Elem {
	i := c.iter(0)
	i.SetInputString(str)
	for i.Next() {
	}
	return i.Elems
}

type iter struct {
	wa [512]colltab.Elem

	colltab.Iter
	pce int
}

func (i *iter) init(c *Collator) {
	i.Weighter = c.t
	i.Elems = i.wa[:0]
}

func (i *iter) nextPrimary() int {
	for {
		for ; i.pce < i.N; i.pce++ {
			if v := i.Elems[i.pce].Primary(); v != 0 {
				i.pce++
				return v
			}
		}
		if !i.Next() {
			return 0
		}
	}
	panic("should not reach here")
}

func (i *iter) nextSecondary() int {
	for ; i.pce < len(i.Elems); i.pce++ {
		if v := i.Elems[i.pce].Secondary(); v != 0 {
			i.pce++
			return v
		}
	}
	return 0
}

func (i *iter) prevSecondary() int {
	for ; i.pce < len(i.Elems); i.pce++ {
		if v := i.Elems[len(i.Elems)-i.pce-1].Secondary(); v != 0 {
			i.pce++
			return v
		}
	}
	return 0
}

func (i *iter) nextTertiary() int {
	for ; i.pce < len(i.Elems); i.pce++ {
		if v := i.Elems[i.pce].Tertiary(); v != 0 {
			i.pce++
			return int(v)
		}
	}
	return 0
}

func (i *iter) nextQuaternary() int {
	for ; i.pce < len(i.Elems); i.pce++ {
		if v := i.Elems[i.pce].Quaternary(); v != 0 {
			i.pce++
			return v
		}
	}
	return 0
}

func appendPrimary(key []byte, p int) []byte {
	// Convert to variable length encoding; supports up to 23 bits.
	if p <= 0x7FFF {
		key = append(key, uint8(p>>8), uint8(p))
	} else {
		key = append(key, uint8(p>>16)|0x80, uint8(p>>8), uint8(p))
	}
	return key
}

// keyFromElems converts the weights ws to a compact sequence of bytes.
// The result will be appended to the byte buffer in buf.
func (c *Collator) keyFromElems(buf *Buffer, ws []colltab.Elem) {
	for _, v := range ws {
		if w := v.Primary(); w > 0 {
			buf.key = appendPrimary(buf.key, w)
		}
	}
	if !c.ignore[colltab.Secondary] {
		buf.key = append(buf.key, 0, 0)
		// TODO: we can use one 0 if we can guarantee that all non-zero weights are > 0xFF.
		if !c.backwards {
			for _, v := range ws {
				if w := v.Secondary(); w > 0 {
					buf.key = append(buf.key, uint8(w>>8), uint8(w))
				}
			}
		} else {
			for i := len(ws) - 1; i >= 0; i-- {
				if w := ws[i].Secondary(); w > 0 {
					buf.key = append(buf.key, uint8(w>>8), uint8(w))
				}
			}
		}
	} else if c.caseLevel {
		buf.key = append(buf.key, 0, 0)
	}
	if !c.ignore[colltab.Tertiary] || c.caseLevel {
		buf.key = append(buf.key, 0, 0)
		for _, v := range ws {
			if w := v.Tertiary(); w > 0 {
				buf.key = append(buf.key, uint8(w))
			}
		}
		// Derive the quaternary weights from the options and other levels.
		// Note that we represent MaxQuaternary as 0xFF. The first byte of the
		// representation of a primary weight is always smaller than 0xFF,
		// so using this single byte value will compare correctly.
		if !c.ignore[colltab.Quaternary] && c.alternate >= altShifted {
			if c.alternate == altShiftTrimmed {
				lastNonFFFF := len(buf.key)
				buf.key = append(buf.key, 0)
				for _, v := range ws {
					if w := v.Quaternary(); w == colltab.MaxQuaternary {
						buf.key = append(buf.key, 0xFF)
					} else if w > 0 {
						buf.key = appendPrimary(buf.key, w)
						lastNonFFFF = len(buf.key)
					}
				}
				buf.key = buf.key[:lastNonFFFF]
			} else {
				buf.key = append(buf.key, 0)
				for _, v := range ws {
					if w := v.Quaternary(); w == colltab.MaxQuaternary {
						buf.key = append(buf.key, 0xFF)
					} else if w > 0 {
						buf.key = appendPrimary(buf.key, w)
					}
				}
			}
		}
	}
}

func processWeights(vw alternateHandling, top uint32, wa []colltab.Elem) {
	ignore := false
	vtop := int(top)
	switch vw {
	case altShifted, altShiftTrimmed:
		for i := range wa {
			if p := wa[i].Primary(); p <= vtop && p != 0 {
				wa[i] = colltab.MakeQuaternary(p)
				ignore = true
			} else if p == 0 {
				if ignore {
					wa[i] = colltab.Ignore
				}
			} else {
				ignore = false
			}
		}
	case altBlanked:
		for i := range wa {
			if p := wa[i].Primary(); p <= vtop && (ignore || p != 0) {
				wa[i] = colltab.Ignore
				ignore = true
			} else {
				ignore = false
			}
		}
	}
}
