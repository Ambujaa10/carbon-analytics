/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import React from "react";
import {Link} from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter";
//App Components
import StatusDashboardAPIS from "../utils/apis/StatusDashboardAPIs";
import Header from "../common/Header";
import ParentAppTable from "./ParentAppTable";
//Material UI
import {GridList, GridTile} from "material-ui/GridList";
import HomeButton from "material-ui/svg-icons/action/home";
import {
    Card,
    CardHeader,
    CardText,
    Dialog,
    Divider,
    FlatButton,
    Toggle,
    Snackbar, RaisedButton
} from "material-ui";
//import DashboardUtils from "../utils/DashboardUtils";
import AuthenticationAPI from "../utils/apis/AuthenticationAPI";
import AuthManager from "../auth/utils/AuthManager";
import { Redirect } from 'react-router-dom';
import Error403 from "../error-pages/Error403";
import StatusDashboardOverViewAPI from "../utils/apis/StatusDashboardOverViewAPI";
import {HttpStatus} from "../utils/Constants";
const styles = {
    root: {display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around'},
    gridList: {width: '90%', height: '50%', overflowY: 'auto', padding: 10, paddingLeft: 60}
};
const messageBoxStyle = {textAlign: "center", color: "white"};
const errorMessageStyle = {backgroundColor: "#FF5722", color: "white"};
const successMessageStyle = {backgroundColor: "#4CAF50", color: "white"};
const codeViewStyle = {
    "hljs": {
        "display": "block",
        "overflowX": "auto",
        "padding": "0.5em",
        "background": "#131313",
        "color": "#dad9d9"
    },
    "hljs-comment": {"color": "#777"},
    "hljs-quote": {"color": "#777"},
    "hljs-variable": {"color": "#ab875d"},
    "hljs-template-variable": {"color": "#ab875d"},
    "hljs-tag": {"color": "#ab875d"},
    "hljs-regexp": {"color": "#ab875d"},
    "hljs-meta": {"color": "#ab875d"},
    "hljs-number": {"color": "#ab875d"},
    "hljs-built_in": {"color": "#ab875d"},
    "hljs-builtin-name": {"color": "#ab875d"},
    "hljs-literal": {"color": "#ab875d"},
    "hljs-params": {"color": "#ab875d"},
    "hljs-symbol": {"color": "#ab875d"},
    "hljs-bullet": {"color": "#ab875d"},
    "hljs-link": {"color": "#ab875d"},
    "hljs-deletion": {"color": "#ab875d"},
    "hljs-section": {"color": "#9b869b"},
    "hljs-title": {"color": "#9b869b"},
    "hljs-name": {"color": "#9b869b"},
    "hljs-selector-id": {"color": "#9b869b"},
    "hljs-selector-class": {"color": "#9b869b"},
    "hljs-type": {"color": "#9b869b"},
    "hljs-attribute": {"color": "#9b869b"},
    "hljs-string": {"color": "#f17b31"},
    "hljs-keyword": {"color": "#f17b31"},
    "hljs-selector-tag": {"color": "#f17b31"},
    "hljs-addition": {"color": "#f17b31"},
    "hljs-emphasis": {"fontStyle": "italic"},
    "hljs-strong": {"fontWeight": "bold"}
};

/**
 * class which manages Siddhi App specific details.
 */
export default class AppView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            workerID: this.props.match.params.id.split("_")[0] + ":" + this.props.match.params.id.split("_")[1],
            appName: this.props.match.params.appName,
            id: this.props.match.params.id,
            appText: '',
            open: false,
            messageStyle: '',
            showMsg: false,
            message: '',
            confirmMessage: '',
            hasManagerPermission: false,
            hasViewerPermission: true,
            sessionInvalid: false
        };
        //this.handleToggle = this.handleToggle.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.showError = this.showError.bind(this);
    }

    componentWillMount() {
        let that = this;
        AuthenticationAPI.isUserAuthorized('metrics.manager',AuthManager.getUser().SDID)
            .then((response) => {
                that.setState({
                    hasManagerPermission: response.data
                });
            }).catch((error) => {
            let message;
            if(error.response != null){
                if(error.response.status === 401){
                    message = "Authentication fail. Please login again.";
                    this.setState({
                        sessionInvalid: true
                    })
                } else if(error.response.status === 403){
                    message = "User Have No Manager Permission to view this page.";
                    this.setState({
                        hasManagerPermission: false
                    })
                } else {
                    message = "Unknown error occurred! : " + error.response.data;
                }
                this.setState({
                    message: message
                })
            }
        });
        AuthenticationAPI.isUserAuthorized('viewer',AuthManager.getUser().SDID)
            .then((response) => {
                that.setState({
                    hasViewerPermission: response.data
                });
            }).catch((error) => {
            let message;
            if(error.response != null) {
                if (error.response.status === 401) {
                    message = "Authentication fail. Please login again.";
                    this.setState({
                        sessionInvalid: true
                    })
                } else if (error.response.status === 403) {
                    message = "User Have No Viewer Permission to view this page.";
                    this.setState({
                        hasViewerPermission: false
                    })
                } else {
                    message = "Unknown error occurred! : " + error.response.data;
                }
                this.setState({
                    message: message
                })
            }
        });

        StatusDashboardAPIS.getSiddhiAppTextView(this.props.match.params.id,this.props.match.params.appName)
            .then((response) =>{
                if(response.status==HttpStatus.OK){
                    console.log("response is"+response.data);
                   that.setState({
                       appText:response.data
                   }) ;

                   console.log("apptext is"+this.state.appText);
                }
            }).catch((error) => {
            if (error.response != null) {
                if (error.response.status === 401) {
                    this.setState({
                        isApiCalled: true,
                        sessionInvalid: true,
                        statusMessage: "Authentication fail. Please login again."
                    })
                } else if (error.response.status === 403) {
                    this.setState({
                        isApiCalled: true,
                        statusMessage: "User Have No Permission to view this page."
                    });
                } else {
                    this.setState({
                        isError: true,
                        isApiCalled: true,
                        statusMessage: "Unknown error occurred! : " + JSON.stringify(error.response.data)
                    });
                }
            }
            // console.log("ClusterList"+this.state.clustersList.toString());
        });
    }

    showError(message) {
        this.setState({
            messageStyle: errorMessageStyle,
            showMsg: true,
            message: message
        });
    }

    showMessage(message) {
        this.setState({
            messageStyle: successMessageStyle,
            showMsg: true,
            message: message
        });
    }

    render() {
        if (this.state.sessionInvalid) {
            return (
                <Redirect to={{pathname: `${window.contextPath}/logout`}}/>
            );
        }
        if (!this.state.hasViewerPermission) {
            return <Error403/>;
        }
        //when state changes the width changes
        let actionsButtons = [
            <FlatButton
                label="Yes"
                backgroundColor='#f17b31'
                onClick={this.handleToggle}
                //disabled={!this.state.hasManagerPermission}
            />,
            <FlatButton
                label="No"
                //disabled={!this.state.hasManagerPermission}
                onClick={() => {
                    this.setState({open: false})
                }}
            />,
        ];

        return (
            <div>
                <Dialog
                    actions={actionsButtons}
                    modal
                    open={this.state.open}
                    onRequestClose={() => this.setState({open: false})}>
                    {this.state.confirmMessage}
                </Dialog>

                <div>
                    <Header/>
                    <div className="navigation-bar">
                        <Link to={window.contextPath}><FlatButton label="Overview >"
                                                                  icon={<HomeButton color="black"/>}/></Link>
                        <Link to={window.contextPath+"/" + this.props.match.params.id+"/"+"siddhi-apps" }>
                            <FlatButton label={this.props.match.params.id + " >"}/></Link>
                        {/*TODO: NEED TO CHANGE THIS ACCORDING TO DESIGN*/}
                        {/*<Link to={window.contextPath + '/worker/' + this.props.match.params.id }>*/}
                            {/*<FlatButton label={this.state.workerID + " >"}/></Link>*/}
                        <RaisedButton label={this.props.match.params.appName} disabled disabledLabelColor='white'
                                      disabledBackgroundColor='#f17b31'/>
                    </div>
                    <div className="worker-h1">
                        <h2 style={{display: 'inline-block', float: 'left', marginLeft: 40}}> {this.state.workerID}
                            : {this.state.appName} </h2>
                    </div>
                </div>

                <div style={{padding: 10, paddingLeft: 40, width: '90%', height:'50%', backgroundColor: "#222222"}}>
                    <Card style={{backgroundColor: "#282828", height:'50%'}}>
                        <CardHeader title="Code View" subtitle={this.props.match.params.appName}
                                    titleStyle={{fontSize: 24, backgroundColor: "#282828"}}
                        />
                        <Divider/>

                        <CardText>
                            <SyntaxHighlighter language='sql'
                                               style={codeViewStyle}>{this.state.appText}</SyntaxHighlighter>
                            {console.log("exection"+this.state.appText)}
                        </CardText>
                    </Card>
                </div>
                <div style={{width: '90%', marginLeft: 40}}>
                    <h3 style={{color: 'white'}}> Child App Details</h3>

                        <ParentAppTable id={this.props.match.params.id} appName={this.props.match.params.appName}/>

                </div>
                <Snackbar contentStyle={messageBoxStyle} bodyStyle={this.state.messageStyle}
                          open={this.state.showMsg}
                          message={this.state.message} autoHideDuration={4000}
                          onRequestClose={() => {
                              this.setState({
                                  showMsg: false,
                                  message: ""
                              });
                          }}
                />
            </div>
        );
    }
}


