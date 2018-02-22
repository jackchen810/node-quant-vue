<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-upload"></i> 批量执行任务</el-breadcrumb-item>
                <el-breadcrumb-item>发起推送</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class='rad-group mb40'>
            <el-tabs v-model="task_type" type="card" @tab-click="handleClick">
                <el-tab-pane label="升级ROM" name="1">
                    <div class="form-box tab-cont form-box2">
                        <el-form :model="form0" :rules="rules0" ref="form0" label-width="150px">
                            <el-form-item label="输入指定MAC" prop="router_mac">
                                <el-input type="textarea" v-model="form0.router_mac"  placeholder="以换行符分割" class="diainp2"></el-input>
                            </el-form-item>
                            <el-form-item label="选择设备型号" prop="dev_type">
                                <el-select v-model="form0.dev_type" placeholder="请选择" @change="changeDev">
                                    <el-option v-for="item in typeListData" :key="item" :label="item" :value="item"></el-option>
                                    <!--<el-option v-for="item in ListData" :key="item.dev_type" :label="item.dev_type" :value="item.dev_type"></el-option>-->
                                </el-select>
                            </el-form-item>
                            <el-form-item label="选择ROM版本" prop="dest_version">
                                <el-select v-model="form0.dest_version" placeholder="请选择" @change="changeRom">
                                    <el-option
                                        v-for="item in romListData"
                                        :key="item.rom_version"
                                        :label="item.rom_version"
                                        :value="item.rom_version">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="所选文件">
                                <el-input v-model="form0.firmware_file" class="diainp2" :disabled="true"></el-input>
                            </el-form-item>
                            <el-form-item label="升级方式" prop="upgrade_mode" :inline="true">
                                <el-radio-group v-model="form0.upgrade_mode" @change="changeUpgrade" :inline="true">
                                    <el-radio label="1">实时自动升级</el-radio>
                                    <el-radio label="2">用户自动升级</el-radio>
                                    <el-radio label="3">定时自动升级(整点时刻)</el-radio>
                                </el-radio-group>
                                <el-select :inline="true" v-if="form0.upgrade_mode=='3'?true:false" v-model="form0.upgrade_time" style="width:70px;" placeholder="0">
                                    <el-option
                                        v-for="item in upgradeTime"
                                        :key="item"
                                        :label="item"
                                        :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="配置更新" prop="reflash">
                                <el-radio-group v-model="form0.reflash">
                                    <el-radio label="0">保留用户原有配置</el-radio>
                                    <el-radio label="1">更改用户原有配置(慎选)</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item label="超时时间" prop="expired_time">
                                <el-input v-model="form0.expired_time" :disabled="form0.isTime" class="inp100"></el-input>
                                <a>&nbsp;小时</a>
                            </el-form-item>
                            <el-form-item label="操作人" prop="operator_name">
                                <el-input v-model="form0.operator_name" class="diainp"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="onRomSubmit('form0')" v-loading.fullscreen.lock="fullscreenLoading">执行</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="安装插件" name="2">

                    <div class="form-box tab-cont form-box2">
                        <el-form :model="form1" :rules="rules1" ref="form1" label-width="150px">
                            <el-form-item label="输入指定MAC" prop="route_mac">
                                <el-input class="textarea-mac diainp2" type="textarea" v-model="form1.route_mac" placeholder="以换行符分割"></el-input>
                            </el-form-item>
                            <el-form-item label="选择要安装的插件" prop="pkg_str_name">
                                <el-select v-model="form1.pkg_str_name" placeholder="请选择" @change="changePlugin">
                                    <el-option
                                        v-for="item in pluginListData"
                                        :key="item.pkg_str_name"
                                        :label="item.pkg_str_name"
                                        :value="item.pkg_str_name">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="选择插件的版本" prop="pkg_version">
                                <el-select v-model="form1.pkg_version" placeholder="请选择">
                                    <el-option
                                        v-for="item in pVerlist"
                                        :key="item.pkg_version"
                                        :label="item.pkg_verion"
                                        :value="item.pkg_version">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="升级方式" prop="pkg_mode" :inline="true">
                                <el-radio-group v-model="form1.pkg_mode" @change="changePkgMode" :inline="true">
                                    <el-radio label="1">实时自动升级</el-radio>
                                    <el-radio label="2">用户自动升级</el-radio>
                                    <el-radio label="3">定时自动升级(整点时刻)</el-radio>
                                </el-radio-group>
                                <el-select :inline="true" v-if="form1.pkg_mode=='3'?true:false" v-model="form1.upgrade_time" style="width:70px;" placeholder="0">
                                    <el-option
                                        v-for="item in pkgmodeTime"
                                        :key="item"
                                        :label="item"
                                        :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="超时时间" prop="expired_time">
                                <el-input v-model="form1.expired_time" :disabled="form1.isTime" class="inp100"></el-input>
                                <a>&nbsp;小时</a>
                            </el-form-item>
                            <el-form-item label="操作人" prop="operator">
                                <el-input v-model="form1.operator" class="diainp"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="onPluginSubmit('form1')">安装</el-button>
                            </el-form-item>
                        </el-form>
                    </div>

                </el-tab-pane>
                <el-tab-pane label="推送脚本" name="3">

                    <div class="form-box tab-cont form-box2">
                        <el-form ref="form2" :model="form2" :rules="rules2" label-width="150px">
                            <el-form-item label="输入指定MAC" prop="route_mac">
                                <el-input class="textarea-mac diainp2" type="textarea" v-model="form2.route_mac" placeholder="以换行符分割"></el-input>
                            </el-form-item>
                            <el-form-item label="选择要安装的脚本" prop="script_name">
                                <el-select v-model="form2.script_name" placeholder="请选择">
                                    <el-option
                                        v-for="item in scriptListData"
                                        :key="item.script_name"
                                        :label="item.script_name"
                                        :value="item.script_name">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="操作人" prop="operator">
                                <el-input v-model="form2.operator" class="diainp"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="onScriptSubmit('form2')">安装</el-button>
                            </el-form-item>
                        </el-form>
                    </div>

                </el-tab-pane>
            </el-tabs>

        </div>

    </div>
</template>

<script>
    import global_ from 'components/common/Global';
    var crypto = require('crypto');
    export default {
        data: function () {
            return {
                form0: {
                    router_mac: '',
                    dev_type: '',
                    dest_version: '',
                    firmware_file:'',
                    firmware_md5:'',
                    upgrade_mode: '1',
                    upgrade_time:'0',
                    reflash:'0',
                    operator_name: '',
                    expired_time:'0',
                    isTime: true
                },
                typeListData:[],
                ListData:[],
                romListData:[],
                upgradeTime:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
                rules0: {
                    router_mac: [
                        {required: true, message: '请输入指定MAC', trigger: 'blur'},
                        {validator: this.validateMac, trigger: 'blur'}
                    ],
                    dev_type: [
                        {required: true, message: '请选择设备型号', trigger: 'change'}
                    ],
                    dest_version: [
                        {required: true, message: '请选择ROM版本', trigger: 'change'}
                    ],
                    upgrade_mode: [
                        {required: true, message: '请选择升级方式', trigger: 'change'}
                    ],
                    reflash:[
                        { required: true, message: '请选择配置更新', trigger: 'change'}
                    ],
                    expired_time: [
                        {required: true, message: '请输入超时时间', trigger: 'blur'},
                        {validator: this.validateTimeNum, trigger: 'blur'}
                    ],
                    operator_name: [
                        {required: true, message: '请输入操作人', trigger: 'blur'},
                        {validator: this.validateSpace, trigger: 'blur'}
                    ]

                },

                form1: {
                    route_mac: '',
                    pkg_str_name: '',
                    pkg_version: '',
                    pkg_mode: '1',
                    upgrade_time:'0',
                    expired_time:'0',
                    isTime: true,
                    operator: ''
                },
                pkgmodeTime:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
                pluginListData:[],
                pVerlist:[],
                rules1: {
                    route_mac: [
                        {required: true, message: '请输入MAC', trigger: 'blur'},
                        {validator: this.validateMac, trigger: 'blur'}
                    ],
                    pkg_str_name: [
                        {required: true, message: '请选择要安装的插件', trigger: 'change'}
                    ],
                    pkg_version: [
                        {required: true, message: '请选择插件的版本', trigger: 'change'}
                    ],
                    pkg_mode: [
                        {required: true, message: '请选择升级方式', trigger: 'change'}
                    ],
                    expired_time: [
                        {required: true, message: '请输入超时时间', trigger: 'blur'},
                        {validator: this.validateTimeNum, trigger: 'blur'}
                    ],
                },

                form2: {
                    route_mac: '',
                    script_name: '',
                    operator: ''
                },
                scriptListData:[],
                rules2: {
                    route_mac: [
                        {required: true, message: '请输入MAC', trigger: 'blur'},
                        {validator: this.validateMac, trigger: 'blur'}
                    ],
                    script_name: [
                        {required: true, message: '请选择要安装的脚本', trigger: 'change'}
                    ]
                    // server_port: [
                    //     {required: true, message: '请选择脚本的版本', trigger: 'change'}
                    // ]
                },
                task_type: '1',
                value: '',

                romtest:[],
                filetest:'',
                fullscreenLoading: false,
            }
        },
        created:function () {
            this.getTypes();
            this.getRomList();
        },
        methods: {
            onRomSubmit:function (formName) {
                var self = this;
                self.$refs[formName].validate(function (valid) {
                    if (valid) {
                        var params = {
                            route_mac:self.form0.router_mac,
                            operator_name:self.form0.operator_name,
                            dev_type:self.form0.dev_type,
                            dest_version:self.form0.dest_version,
                            firmware_file:self.form0.firmware_file,
                            firmware_md5:self.form0.firmware_md5,
                            upgrade_mode:self.form0.upgrade_mode,
                            upgrade_time:self.form0.upgrade_time,
                            reflash:self.form0.reflash,
                            expired_time:self.form0.expired_time
                        };
                        self.fullscreenLoading = true;
                        self.$axios.post(global_.baseUrl + '/task/add/sysupgrade',params).then(function (res) {
                            // console.log(res.data);
                            self.fullscreenLoading = false;
                            if(res.data.ret_code == '1001'){
                                self.$message({message:res.data.extra,type:'warning'});
                                setTimeout(function(){
                                    self.$router.replace('login');
                                },2000)
                            }
                            if(res.data.ret_code == 0){
                                self.$message({message:'推送成功',type:'success'});
                            }else{
                                self.$message.error(res.data.extra);
                            }
                            self.form0.router_mac = '';
                            self.form0.dev_type = '';
                            self.form0.dest_version = '';
                            self.form0.firmware_file = '';
                            self.form0.firmware_md5 = '';
                            self.form0.upgrade_mode = '1';
                            self.form0.upgrade_time = '';
                            self.form0.reflash = '0';
                            self.form0.operator_name = '';
                            self.form0.expired_time = '0';
                        })

                    } else {
                        return false;
                        console.log('验证失败');
                    }
                });

            },
            onPluginSubmit: function (formName) {
                var self = this;
                self.$refs[formName].validate(function (valid) {
                    if (valid) {
                        var params = {
                            route_mac:self.form1.route_mac,
                            pkg_str_name: self.form1.pkg_str_name,
                            pkg_version:self.form1.pkg_version,
                            pkg_mode: self.form1.pkg_mode,
                            upgrade_time: self.form1.upgrade_time,
                            expired_time:self.form1.expired_time,
                            operator:self.form1.operator
                        };
                        self.fullscreenLoading = true;
                        self.$axios.post(global_.baseUrl + '/manage/apps',params).then(function (res) {
                            self.fullscreenLoading = false;
                            if(res.data.ret_code == '1001'){
                                self.$message({message:res.data.extra,type:'warning'});
                                setTimeout(function(){
                                    self.$router.replace('login');
                                },2000)
                            }
                            if(res.data.ret_code == 0){
                                self.$message({message:res.data.extra,type:'success'});
                            }else{
                                self.$message.error(res.data.extra)
                            }
                            self.form1.route_mac = '';
                            self.form1.pkg_str_name = '';
                            self.form1.pkg_version = '';
                            self.form1.pkg_mode = '1';
                            self.form1.upgrade_time = '';
                            self.form1.expired_time = '0';
                            self.form1.isTime = true;
                            self.form1.operator = '';

                        })

                    } else {
                        return false;
                        console.log('验证失败');
                    }
                });

            },
            onScriptSubmit: function(formName) {
                var self = this;
                self.$refs[formName].validate(function (valid) {
                    if (valid) {
                        var params = {
                            route_mac:self.form2.route_mac,
                            script_name: self.form2.script_name,
                            operator:self.form1.operator
                        };
                        self.fullscreenLoading = true;
                        self.$axios.post(global_.baseUrl + '/manage/script',params).then(function (res) {
                            self.fullscreenLoading = false;
                            if(res.data.ret_code == '1001'){
                                self.$message({message:res.data.extra,type:'warning'});
                                setTimeout(function(){
                                    self.$router.replace('login');
                                },2000)
                            }
                            if(res.data.ret_code == 0){
                                self.$message({message:res.data.extra,type:'success'});
                            }else{
                                self.$message.error(res.data.extra)
                            }
                            self.form2.route_mac = '';
                            self.form2.script_name = '';
                            self.form2.operator = '';

                        })

                    } else {
                        return false;
                        console.log('验证失败');
                    }
                });

            },
            getTypes: function(){//获取设备型号
                var self = this;
                self.$axios.post(global_.baseUrl+'/devtype/types').then(function(res){
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        self.typeListData = res.data.extra;
                    }
                })
            },
            getRomList: function(){//获取rom版本
                var self = this;
                self.$axios.post(global_.baseUrl+'/rom/list').then(function(res){
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        self.ListData = res.data.extra;
                    }
                })
            },
            getSysinfo: function () {
                var self = this;
                var params = {
                    user_name:localStorage.getItem('ms_username'),
                    router_mac: self.splitStr(self.form0.router_mac).join(','),
                    task_type:self.task_type,
                    upgrade_type:self.form0.upgrade_type,
                    expired_time:self.form0.expired_time,
                    firmware_url: self.filetest
                };
                self.$axios({
                    method: 'get',
                    headers: {'Content-Type': 'application/json'},
                    url: global_.baseUrl + '/device/sysinfo'
                }).then(function (response) {
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    console.log(response);
                }, function (err) {
                    console.log(err);
                });
            },
            getPkgData: function(){//获取插件列表
                var self = this;
                self.$axios.post(global_.baseUrl+'/pkg/list').then(function(res){
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        var result = res.data.extra;
                        for(var i in result){
                            self.pluginListData.push({pkg_str_name:result[i]._id.pkg_str_name,pkg_version:result[i]._id.pkg_version});
                        }
                    }
                })
            },
            getScriptData: function(){
                var self = this;
                self.loading = true;
                self.$axios.post(global_.baseUrl+'/script/list').then(function(res){
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.scriptListData = res.data.extra;
                    }else{
                        self.$message.error(res.data.extra)
                    }
                })
            },
            changeDev: function(){
                var self = this;
                self.form0.dest_version = '';
                self.form0.firmware_file = '';
                self.form0.firmware_md5 = '';
                var curdevnum = self.form0.dev_type;
                var resultArr = [];
                var list = self.ListData;
                for(var i=0;i<list.length;i++){
                    if(list[i].dev_type == curdevnum){
                        resultArr.push(list[i])
                    }
                }
                self.romListData = resultArr;
                if(resultArr.length){
                    self.form0.dest_version = resultArr[0].rom_version || '';
                    self.form0.firmware_file = resultArr[0].file_name || '';
                    self.form0.firmware_md5 = resultArr[0].md5_value || '';
                }

            },
            changeRom: function(){
                var self = this;
                var curromv = self.form0.dest_version;
                var resultArr = [];
                var list = self.ListData;
                for(var i=0;i<list.length;i++){
                    if(list[i].dev_type == self.form0.dev_type && list[i].rom_version == curromv){
                        self.form0.firmware_file = list[i].file_name;
                        self.form0.firmware_md5 = list[i].md5_value
                    }
                }

            },
            changeUpgrade: function(value){
                if(value == '1'){
                    this.form0.expired_time = '0';
                    this.form0.isTime =  true;
                }else{
                    this.form0.expired_time = '';
                    this.form0.isTime =  false;
                }
                if(value == '3'){

                }
            },
            handleClick:function (tab,event) {
                var self = this;
                if(tab.name == '1'){
                    self.getRomList();
                }
                if(tab.name == '2'){
                    self.getPkgData({});
                }
                if(tab.name == '3'){
                    self.getScriptData();
                }
            },
            validateSpace: function (rule, value, callback) {
                var self = this;
                if(value.indexOf(' ')>=0){
                    callback(new Error('输入有空格'));
                }else{
                    callback();
                }
            },
            validateTimeNum: function (rule, value, callback) {
                var self = this;
                var reg = /^\d+$/;
                if(!reg.test(value) || Number(value)<24){
                    callback(new Error('输入必须是数字,且大于24'));
                }else{
                    callback();
                }
            },
            validateMac: function (rule, value, callback) {
                var self = this;
                var reg_name = /^[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}$/;
                var reg_name2 = /^[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}$/;
                var macarr = self.splitStr(value);
                var len = macarr.length;
                for (var i = 0; i < len; i++) {
                    if (!reg_name.test(macarr[i]) && !reg_name2.test(macarr[i])) {
                        callback(new Error('输入有误，以逗号或回车分隔'));
                    } else {
                        callback();
                    }
                }
            },
            //按逗号和回车分隔字符串
            splitStr: function (str) {
                var temp = str.split(/[\n,]/g);
                for (var i = 0; i < temp.length; i++) {
                    if (temp[i] == "") {
                        temp.splice(i, 1);
                        //删除数组索引位置应保持不变
                        i--;
                    }
                }
                return temp;
            },
            changePlugin: function(){
                var self = this;
                var curplugin = self.form1.pkg_str_name;
                var resultArr = [];
                var list = self.pluginListData;
                for(var i=0;i<list.length;i++){
                    if(list[i].pkg_str_name == self.form1.pkg_str_name){
                        resultArr.push(list[i]);
                    }
                }
                self.pVerlist = resultArr;
                if(resultArr.length){
                    self.form1.pkg_version = resultArr[0].pkg_version || '';
                }
            },
            changePkgMode: function(value){
                if(value == '1'){
                    this.form1.expired_time = '0';
                    this.form1.isTime =  true;
                }else{
                    this.form1.expired_time = ' ';
                    this.form1.isTime =  false;
                }
                if(value == '3'){

                }
            },
        }
    }
</script>
<style>
    .mb40 {margin-bottom: 40px;}
    .tab-cont {padding: 40px; /*border-top:1px solid #dfe6ec;*/}
    .diainp{width:217px;}
    .diainp2{width:450px;}
    .inp100{width:100px;}
    /*.textarea-mac{height:160px;}*/
    .form-box2{width:700px;}
</style>
