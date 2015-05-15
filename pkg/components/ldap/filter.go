// Copyright 2011 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package ldap

import (
	"errors"
	"fmt"

	"github.com/gogits/gogs/modules/asn1-ber"
)

const (
	FilterAnd             = 0
	FilterOr              = 1
	FilterNot             = 2
	FilterEqualityMatch   = 3
	FilterSubstrings      = 4
	FilterGreaterOrEqual  = 5
	FilterLessOrEqual     = 6
	FilterPresent         = 7
	FilterApproxMatch     = 8
	FilterExtensibleMatch = 9
)

var FilterMap = map[uint64]string{
	FilterAnd:             "And",
	FilterOr:              "Or",
	FilterNot:             "Not",
	FilterEqualityMatch:   "Equality Match",
	FilterSubstrings:      "Substrings",
	FilterGreaterOrEqual:  "Greater Or Equal",
	FilterLessOrEqual:     "Less Or Equal",
	FilterPresent:         "Present",
	FilterApproxMatch:     "Approx Match",
	FilterExtensibleMatch: "Extensible Match",
}

const (
	FilterSubstringsInitial = 0
	FilterSubstringsAny     = 1
	FilterSubstringsFinal   = 2
)

var FilterSubstringsMap = map[uint64]string{
	FilterSubstringsInitial: "Substrings Initial",
	FilterSubstringsAny:     "Substrings Any",
	FilterSubstringsFinal:   "Substrings Final",
}

func CompileFilter(filter string) (*ber.Packet, error) {
	if len(filter) == 0 || filter[0] != '(' {
		return nil, NewError(ErrorFilterCompile, errors.New("ldap: filter does not start with an '('"))
	}
	packet, pos, err := compileFilter(filter, 1)
	if err != nil {
		return nil, err
	}
	if pos != len(filter) {
		return nil, NewError(ErrorFilterCompile, errors.New("ldap: finished compiling filter with extra at end: "+fmt.Sprint(filter[pos:])))
	}
	return packet, nil
}

func DecompileFilter(packet *ber.Packet) (ret string, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = NewError(ErrorFilterDecompile, errors.New("ldap: error decompiling filter"))
		}
	}()
	ret = "("
	err = nil
	childStr := ""

	switch packet.Tag {
	case FilterAnd:
		ret += "&"
		for _, child := range packet.Children {
			childStr, err = DecompileFilter(child)
			if err != nil {
				return
			}
			ret += childStr
		}
	case FilterOr:
		ret += "|"
		for _, child := range packet.Children {
			childStr, err = DecompileFilter(child)
			if err != nil {
				return
			}
			ret += childStr
		}
	case FilterNot:
		ret += "!"
		childStr, err = DecompileFilter(packet.Children[0])
		if err != nil {
			return
		}
		ret += childStr

	case FilterSubstrings:
		ret += ber.DecodeString(packet.Children[0].Data.Bytes())
		ret += "="
		switch packet.Children[1].Children[0].Tag {
		case FilterSubstringsInitial:
			ret += ber.DecodeString(packet.Children[1].Children[0].Data.Bytes()) + "*"
		case FilterSubstringsAny:
			ret += "*" + ber.DecodeString(packet.Children[1].Children[0].Data.Bytes()) + "*"
		case FilterSubstringsFinal:
			ret += "*" + ber.DecodeString(packet.Children[1].Children[0].Data.Bytes())
		}
	case FilterEqualityMatch:
		ret += ber.DecodeString(packet.Children[0].Data.Bytes())
		ret += "="
		ret += ber.DecodeString(packet.Children[1].Data.Bytes())
	case FilterGreaterOrEqual:
		ret += ber.DecodeString(packet.Children[0].Data.Bytes())
		ret += ">="
		ret += ber.DecodeString(packet.Children[1].Data.Bytes())
	case FilterLessOrEqual:
		ret += ber.DecodeString(packet.Children[0].Data.Bytes())
		ret += "<="
		ret += ber.DecodeString(packet.Children[1].Data.Bytes())
	case FilterPresent:
		ret += ber.DecodeString(packet.Children[0].Data.Bytes())
		ret += "=*"
	case FilterApproxMatch:
		ret += ber.DecodeString(packet.Children[0].Data.Bytes())
		ret += "~="
		ret += ber.DecodeString(packet.Children[1].Data.Bytes())
	}

	ret += ")"
	return
}

func compileFilterSet(filter string, pos int, parent *ber.Packet) (int, error) {
	for pos < len(filter) && filter[pos] == '(' {
		child, newPos, err := compileFilter(filter, pos+1)
		if err != nil {
			return pos, err
		}
		pos = newPos
		parent.AppendChild(child)
	}
	if pos == len(filter) {
		return pos, NewError(ErrorFilterCompile, errors.New("ldap: unexpected end of filter"))
	}

	return pos + 1, nil
}

func compileFilter(filter string, pos int) (*ber.Packet, int, error) {
	var packet *ber.Packet
	var err error

	defer func() {
		if r := recover(); r != nil {
			err = NewError(ErrorFilterCompile, errors.New("ldap: error compiling filter"))
		}
	}()

	newPos := pos
	switch filter[pos] {
	case '(':
		packet, newPos, err = compileFilter(filter, pos+1)
		newPos++
		return packet, newPos, err
	case '&':
		packet = ber.Encode(ber.ClassContext, ber.TypeConstructed, FilterAnd, nil, FilterMap[FilterAnd])
		newPos, err = compileFilterSet(filter, pos+1, packet)
		return packet, newPos, err
	case '|':
		packet = ber.Encode(ber.ClassContext, ber.TypeConstructed, FilterOr, nil, FilterMap[FilterOr])
		newPos, err = compileFilterSet(filter, pos+1, packet)
		return packet, newPos, err
	case '!':
		packet = ber.Encode(ber.ClassContext, ber.TypeConstructed, FilterNot, nil, FilterMap[FilterNot])
		var child *ber.Packet
		child, newPos, err = compileFilter(filter, pos+1)
		packet.AppendChild(child)
		return packet, newPos, err
	default:
		attribute := ""
		condition := ""
		for newPos < len(filter) && filter[newPos] != ')' {
			switch {
			case packet != nil:
				condition += fmt.Sprintf("%c", filter[newPos])
			case filter[newPos] == '=':
				packet = ber.Encode(ber.ClassContext, ber.TypeConstructed, FilterEqualityMatch, nil, FilterMap[FilterEqualityMatch])
			case filter[newPos] == '>' && filter[newPos+1] == '=':
				packet = ber.Encode(ber.ClassContext, ber.TypeConstructed, FilterGreaterOrEqual, nil, FilterMap[FilterGreaterOrEqual])
				newPos++
			case filter[newPos] == '<' && filter[newPos+1] == '=':
				packet = ber.Encode(ber.ClassContext, ber.TypeConstructed, FilterLessOrEqual, nil, FilterMap[FilterLessOrEqual])
				newPos++
			case filter[newPos] == '~' && filter[newPos+1] == '=':
				packet = ber.Encode(ber.ClassContext, ber.TypeConstructed, FilterApproxMatch, nil, FilterMap[FilterLessOrEqual])
				newPos++
			case packet == nil:
				attribute += fmt.Sprintf("%c", filter[newPos])
			}
			newPos++
		}
		if newPos == len(filter) {
			err = NewError(ErrorFilterCompile, errors.New("ldap: unexpected end of filter"))
			return packet, newPos, err
		}
		if packet == nil {
			err = NewError(ErrorFilterCompile, errors.New("ldap: error parsing filter"))
			return packet, newPos, err
		}
		packet.AppendChild(ber.NewString(ber.ClassUniversal, ber.TypePrimitive, ber.TagOctetString, attribute, "Attribute"))
		switch {
		case packet.Tag == FilterEqualityMatch && condition == "*":
			packet.Tag = FilterPresent
			packet.Description = FilterMap[uint64(packet.Tag)]
		case packet.Tag == FilterEqualityMatch && condition[0] == '*' && condition[len(condition)-1] == '*':
			// Any
			packet.Tag = FilterSubstrings
			packet.Description = FilterMap[uint64(packet.Tag)]
			seq := ber.Encode(ber.ClassUniversal, ber.TypeConstructed, ber.TagSequence, nil, "Substrings")
			seq.AppendChild(ber.NewString(ber.ClassContext, ber.TypePrimitive, FilterSubstringsAny, condition[1:len(condition)-1], "Any Substring"))
			packet.AppendChild(seq)
		case packet.Tag == FilterEqualityMatch && condition[0] == '*':
			// Final
			packet.Tag = FilterSubstrings
			packet.Description = FilterMap[uint64(packet.Tag)]
			seq := ber.Encode(ber.ClassUniversal, ber.TypeConstructed, ber.TagSequence, nil, "Substrings")
			seq.AppendChild(ber.NewString(ber.ClassContext, ber.TypePrimitive, FilterSubstringsFinal, condition[1:], "Final Substring"))
			packet.AppendChild(seq)
		case packet.Tag == FilterEqualityMatch && condition[len(condition)-1] == '*':
			// Initial
			packet.Tag = FilterSubstrings
			packet.Description = FilterMap[uint64(packet.Tag)]
			seq := ber.Encode(ber.ClassUniversal, ber.TypeConstructed, ber.TagSequence, nil, "Substrings")
			seq.AppendChild(ber.NewString(ber.ClassContext, ber.TypePrimitive, FilterSubstringsInitial, condition[:len(condition)-1], "Initial Substring"))
			packet.AppendChild(seq)
		default:
			packet.AppendChild(ber.NewString(ber.ClassUniversal, ber.TypePrimitive, ber.TagOctetString, condition, "Condition"))
		}
		newPos++
		return packet, newPos, err
	}
}
