// Copyright 2014 The Gogs Authors. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

// Code from https://github.com/gogits/gogs/blob/v0.7.0/modules/avatar/avatar.go

package avatar

import (
	"bufio"
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/grafana/grafana/pkg/log"
	"github.com/grafana/grafana/pkg/setting"
)

var gravatarSource string

func UpdateGravatarSource() {
	srcCfg := "//secure.gravatar.com/avatar/"

	gravatarSource = srcCfg
	if strings.HasPrefix(gravatarSource, "//") {
		gravatarSource = "http:" + gravatarSource
	} else if !strings.HasPrefix(gravatarSource, "http://") &&
		!strings.HasPrefix(gravatarSource, "https://") {
		gravatarSource = "http://" + gravatarSource
	}
}

// hash email to md5 string
// keep this func in order to make this package independent
func HashEmail(email string) string {
	// https://en.gravatar.com/site/implement/hash/
	email = strings.TrimSpace(email)
	email = strings.ToLower(email)

	h := md5.New()
	h.Write([]byte(email))
	return hex.EncodeToString(h.Sum(nil))
}

// Avatar represents the avatar object.
type Avatar struct {
	hash      string
	reqParams string
	data      *bytes.Buffer
	notFound  bool
	timestamp time.Time
}

func New(hash string) *Avatar {
	return &Avatar{
		hash: hash,
		reqParams: url.Values{
			"d":    {"retro"},
			"size": {"200"},
			"r":    {"pg"}}.Encode(),
	}
}

func (this *Avatar) Expired() bool {
	return time.Since(this.timestamp) > (time.Minute * 10)
}

func (this *Avatar) Encode(wr io.Writer) error {
	_, err := wr.Write(this.data.Bytes())
	return err
}

func (this *Avatar) Update() (err error) {
	select {
	case <-time.After(time.Second * 3):
		err = fmt.Errorf("get gravatar image %s timeout", this.hash)
	case err = <-thunder.GoFetch(gravatarSource+this.hash+"?"+this.reqParams, this):
	}
	return err
}

type service struct {
	notFound *Avatar
	cache    map[string]*Avatar
}

func (this *service) mustInt(r *http.Request, defaultValue int, keys ...string) (v int) {
	for _, k := range keys {
		if _, err := fmt.Sscanf(r.FormValue(k), "%d", &v); err == nil {
			defaultValue = v
		}
	}
	return defaultValue
}

func (this *service) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	urlPath := r.URL.Path
	hash := urlPath[strings.LastIndex(urlPath, "/")+1:]

	var avatar *Avatar

	if avatar, _ = this.cache[hash]; avatar == nil {
		avatar = New(hash)
	}

	if avatar.Expired() {
		if err := avatar.Update(); err != nil {
			log.Trace("avatar update error: %v", err)
			avatar = this.notFound
		}
	}

	if avatar.notFound {
		avatar = this.notFound
	} else {
		this.cache[hash] = avatar
	}

	w.Header().Set("Content-Type", "image/jpeg")
	w.Header().Set("Content-Length", strconv.Itoa(len(avatar.data.Bytes())))
	w.Header().Set("Cache-Control", "private, max-age=3600")

	if err := avatar.Encode(w); err != nil {
		log.Warn("avatar encode error: %v", err)
		w.WriteHeader(500)
	}
}

func CacheServer() http.Handler {
	UpdateGravatarSource()

	return &service{
		notFound: newNotFound(),
		cache:    make(map[string]*Avatar),
	}
}

func newNotFound() *Avatar {
	avatar := &Avatar{notFound: true}

	// load transparent png into buffer
	path := filepath.Join(setting.StaticRootPath, "img", "transparent.png")

	if data, err := ioutil.ReadFile(path); err != nil {
		log.Error(3, "Failed to read transparent.png, %v", path)
	} else {
		avatar.data = bytes.NewBuffer(data)
	}

	return avatar
}

// thunder downloader
var thunder = &Thunder{QueueSize: 10}

type Thunder struct {
	QueueSize int // download queue size
	q         chan *thunderTask
	once      sync.Once
}

func (t *Thunder) init() {
	if t.QueueSize < 1 {
		t.QueueSize = 1
	}
	t.q = make(chan *thunderTask, t.QueueSize)
	for i := 0; i < t.QueueSize; i++ {
		go func() {
			for {
				task := <-t.q
				task.Fetch()
			}
		}()
	}
}

func (t *Thunder) Fetch(url string, avatar *Avatar) error {
	t.once.Do(t.init)
	task := &thunderTask{
		Url:    url,
		Avatar: avatar,
	}
	task.Add(1)
	t.q <- task
	task.Wait()
	return task.err
}

func (t *Thunder) GoFetch(url string, avatar *Avatar) chan error {
	c := make(chan error)
	go func() {
		c <- t.Fetch(url, avatar)
	}()
	return c
}

// thunder download
type thunderTask struct {
	Url    string
	Avatar *Avatar
	sync.WaitGroup
	err error
}

func (this *thunderTask) Fetch() {
	this.err = this.fetch()
	this.Done()
}

var client *http.Client = &http.Client{
	Timeout:   time.Second * 2,
	Transport: &http.Transport{Proxy: http.ProxyFromEnvironment},
}

func (this *thunderTask) fetch() error {
	this.Avatar.timestamp = time.Now()

	log.Debug("avatar.fetch(fetch new avatar): %s", this.Url)
	req, _ := http.NewRequest("GET", this.Url, nil)
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/jpeg,image/png,*/*;q=0.8")
	req.Header.Set("Accept-Encoding", "deflate,sdch")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.8")
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.154 Safari/537.36")
	resp, err := client.Do(req)

	if err != nil {
		this.Avatar.notFound = true
		return fmt.Errorf("gravatar unreachable, %v", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		this.Avatar.notFound = true
		return fmt.Errorf("status code: %d", resp.StatusCode)
	}

	this.Avatar.data = &bytes.Buffer{}
	writer := bufio.NewWriter(this.Avatar.data)

	if _, err = io.Copy(writer, resp.Body); err != nil {
		return err
	}

	return nil
}
