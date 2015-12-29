// Copyright 2015 Comcast Cable Communications Management, LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// This file was initially generated by gen_goto2.go (add link), as a start
// of the Traffic Ops golang data model

package todb

import (
	"encoding/json"
	"fmt"
	"gopkg.in/guregu/null.v3"
	"time"
)

type Cachegroup struct {
	Id                 int64      `db:"id" json:"id"`
	Name               string     `db:"name" json:"name"`
	ShortName          string     `db:"short_name" json:"shortName"`
	Latitude           null.Float `db:"latitude" json:"latitude"`
	Longitude          null.Float `db:"longitude" json:"longitude"`
	ParentCachegroupId null.Int   `db:"parent_cachegroup_id" json:"parentCachegroupId"`
	Type               int64      `db:"type" json:"type"`
	LastUpdated        time.Time  `db:"last_updated" json:"lastUpdated"`
}

func handleCachegroup(method string, id int, payload []byte) (interface{}, error) {
	if method == "GET" {
		return getCachegroup(id)
	} else if method == "POST" {
		return postCachegroup(payload)
	} else if method == "PUT" {
		return putCachegroup(id, payload)
	} else if method == "DELETE" {
		return delCachegroup(id)
	}
	return nil, nil
}

func getCachegroup(id int) (interface{}, error) {
	ret := []Cachegroup{}
	if id >= 0 {
		err := globalDB.Select(&ret, "select * from cachegroup where id=$1", id)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
	} else {
		queryStr := "select * from cachegroup"
		err := globalDB.Select(&ret, queryStr)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
	}
	return ret, nil
}

func postCachegroup(payload []byte) (interface{}, error) {
	var v Asn
	err := json.Unmarshal(payload, &v)
	if err != nil {
		fmt.Println(err)
	}
	sqlString := "INSERT INTO cachegroup("
	sqlString += "name"
	sqlString += ",short_name"
	sqlString += ",latitude"
	sqlString += ",longitude"
	sqlString += ",parent_cachegroup_id"
	sqlString += ",type"
	sqlString += ") VALUES ("
	sqlString += ":name"
	sqlString += ",:short_name"
	sqlString += ",:latitude"
	sqlString += ",:longitude"
	sqlString += ",:parent_cachegroup_id"
	sqlString += ",:type"
	sqlString += ")"
	result, err := globalDB.NamedExec(sqlString, v)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return result, err
}

func putCachegroup(id int, payload []byte) (interface{}, error) {
	// Note this depends on the json having the correct id!
	var v Asn
	err := json.Unmarshal(payload, &v)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	v.LastUpdated = time.Now()
	sqlString := "UPDATE cachegroup SET "
	sqlString += "name = :name"
	sqlString += ",short_name = :short_name"
	sqlString += ",latitude = :latitude"
	sqlString += ",longitude = :longitude"
	sqlString += ",parent_cachegroup_id = :parent_cachegroup_id"
	sqlString += ",type = :type"
	sqlString += ",last_updated = :last_updated"
	sqlString += " WHERE id=:id"
	result, err := globalDB.NamedExec(sqlString, v)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return result, err
}

func delCachegroup(id int) (interface{}, error) {
	result, err := globalDB.Exec("DELETE FROM cachegroup WHERE id=$1", id)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return result, err
}
