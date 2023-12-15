//import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { Config } from '../../app/config';

 
@Injectable()
export class AuthService {
    private tokenName = 'token';
    private tokenPrefix = 'hearme';
    
    public checkedToken_Success = false;
    
    constructor(private conf: Config, private http : Http) {}
    
    public login(credentials) {
        
        if (credentials.device_id === null || credentials.device_id === null) {
            return Observable.throw("Please insert credentials");
        } else {
            return Observable.create(observer => {
                // Authenticate device with device_id and device_id (call to backend)
                let bodyString = JSON.stringify(credentials);
                let headers = new Headers({ 'Content-Type': 'application/json' });
                let options = new RequestOptions({ headers: headers });
        
                //let access = false;
                this.http
                .post( this.conf.oauth_Service + 'device/token', bodyString, options )
                .subscribe(
                    (res) => {
                        this.setToken(res.json().token);
                        this.checkedToken_Success = true;
                        observer.next(true);
                    },
                    (err) => {
                        observer.next(false);
                    },
                    () => observer.complete()
                );
            });
        }
        
    }
    
    private setToken(token) {
        localStorage.setItem(this.tokenPrefix + "_" + this.tokenName, token) 
    }
    
    public getToken() {
        return localStorage.getItem(this.tokenPrefix + "_" + this.tokenName);
    }
    
    /**
    Check if user logged in
    return an Observer object of Boolean
        - True: logged
        - Falase: not logged
    */
    public checkLoggedIn() {
        return Observable.create(observer => {
            // Check token in localStorage
            var token = this.getToken();
            if (!token) {
                observer.next(false);
            } else if (!this.checkedToken_Success) {
                // Recheck token is valid or not
                let headers = new Headers({ 'Authorization': 'BEARER ' + token });
                let options = new RequestOptions({ headers: headers });
                
                this.http
                .get(this.conf.oauth_Service + 'device/check_token', options)
                .subscribe (
                    (res) => {
                        //console.log("Token in storage is valid", res);
                        this.checkedToken_Success = true;
                        observer.next(true);
                    },
                    (err) => {
                        console.log("Token in storage is expired. Remove it.");
                        localStorage.removeItem(this.tokenPrefix + "_" + this.tokenName);
                        observer.next(false);
                    },
                    () => observer.complete()
                )
            } else {
                observer.next(true);
            }
        });    
    }
    
    public checkToken() {
        return Observable.create(observer => {
            // Check token in localStorage
            var token = this.getToken();
            if (!token) {
                observer.next('');
            } else {
                // Recheck token is valid or not
                let headers = new Headers({ 'Authorization': 'BEARER ' + token });
                let options = new RequestOptions({ headers: headers });
                
                this.http.get(this.conf.oauth_Service + 'device/check_token', options)
                .subscribe ((res) => {
                    //console.log("check_token", res);
                    observer.next(res.json());
                },
                (err) => {
                    console.log("Token err", err);
                    observer.next('');
                },
                () => observer.complete()
                )
            }
        });    
    }
    
    public logout() {
        // Clear token in localStorage
        localStorage.removeItem(this.tokenPrefix + "_" + this.tokenName);
        return;
    }
    
}