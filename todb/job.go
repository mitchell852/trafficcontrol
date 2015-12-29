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

type Job struct {
	Id                 int64       `db:"id" json:"id"`
	Agent              null.Int    `db:"agent" json:"agent"`
	ObjectType         null.String `db:"object_type" json:"objectType"`
	ObjectName         null.String `db:"object_name" json:"objectName"`
	Keyword            string      `db:"keyword" json:"keyword"`
	Parameters         null.String `db:"parameters" json:"parameters"`
	AssetUrl           string      `db:"asset_url" json:"assetUrl"`
	AssetType          string      `db:"asset_type" json:"assetType"`
	Status             int64       `db:"status" json:"status"`
	StartTime          time.Time   `db:"start_time" json:"startTime"`
	EnteredTime        time.Time   `db:"entered_time" json:"enteredTime"`
	JobUser            int64       `db:"job_user" json:"jobUser"`
	LastUpdated        time.Time   `db:"last_updated" json:"lastUpdated"`
	JobDeliveryservice null.Int    `db:"job_deliveryservice" json:"jobDeliveryservice"`
}

func handleJob(method string, id int, payload []byte) (interface{}, error) {
	if method == "GET" {
		return getJob(id)
	} else if method == "POST" {
		return postJob(payload)
	} else if method == "PUT" {
		return putJob(id, payload)
	} else if method == "DELETE" {
		return delJob(id)
	}
	return nil, nil
}

func getJob(id int) (interface{}, error) {
	ret := []Job{}
	if id >= 0 {
		err := globalDB.Select(&ret, "select * from job where id=$1", id)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
	} else {
		queryStr := "select * from job"
		err := globalDB.Select(&ret, queryStr)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
	}
	return ret, nil
}

func postJob(payload []byte) (interface{}, error) {
	var v Asn
	err := json.Unmarshal(payload, &v)
	if err != nil {
		fmt.Println(err)
	}
	sqlString := "INSERT INTO job("
	sqlString += "agent"
	sqlString += ",object_type"
	sqlString += ",object_name"
	sqlString += ",keyword"
	sqlString += ",parameters"
	sqlString += ",asset_url"
	sqlString += ",asset_type"
	sqlString += ",status"
	sqlString += ",start_time"
	sqlString += ",entered_time"
	sqlString += ",job_user"
	sqlString += ",job_deliveryservice"
	sqlString += ") VALUES ("
	sqlString += ":agent"
	sqlString += ",:object_type"
	sqlString += ",:object_name"
	sqlString += ",:keyword"
	sqlString += ",:parameters"
	sqlString += ",:asset_url"
	sqlString += ",:asset_type"
	sqlString += ",:status"
	sqlString += ",:start_time"
	sqlString += ",:entered_time"
	sqlString += ",:job_user"
	sqlString += ",:job_deliveryservice"
	sqlString += ")"
	result, err := globalDB.NamedExec(sqlString, v)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return result, err
}

func putJob(id int, payload []byte) (interface{}, error) {
	// Note this depends on the json having the correct id!
	var v Asn
	err := json.Unmarshal(payload, &v)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	v.LastUpdated = time.Now()
	sqlString := "UPDATE job SET "
	sqlString += "agent = :agent"
	sqlString += ",object_type = :object_type"
	sqlString += ",object_name = :object_name"
	sqlString += ",keyword = :keyword"
	sqlString += ",parameters = :parameters"
	sqlString += ",asset_url = :asset_url"
	sqlString += ",asset_type = :asset_type"
	sqlString += ",status = :status"
	sqlString += ",start_time = :start_time"
	sqlString += ",entered_time = :entered_time"
	sqlString += ",job_user = :job_user"
	sqlString += ",last_updated = :last_updated"
	sqlString += ",job_deliveryservice = :job_deliveryservice"
	sqlString += " WHERE id=:id"
	result, err := globalDB.NamedExec(sqlString, v)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return result, err
}

func delJob(id int) (interface{}, error) {
	result, err := globalDB.Exec("DELETE FROM job WHERE id=$1", id)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return result, err
}
