<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-upload"></i>推送结果</el-breadcrumb-item>
                <el-breadcrumb-item>{{titMsg}}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class='rad-group mb40'>
            <div class="form-box tab-cont" style="width:90%;" v-if="isShow=='firmware'?true:false" v-loading="loading">
                <el-form :model="formFirmware" ref="formFirmware" label-width="150px">
                    <el-form-item label="路由响应信息" prop="msg">
                        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 8}" v-model="formFirmware.msg"></el-input>
                    </el-form-item>
                    <el-form-item label="抓取路由信息" prop="response_msg">
                        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 16}" v-model="formFirmware.response_msg"></el-input>
                    </el-form-item>
                    <el-form-item label="下发固件命令" prop="request_msg">
                        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 8}" v-model="formFirmware.request_msg"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div class="form-box tab-cont" style="width:90%;" v-if="isShow=='apps'?true:false" v-loading="loading">
                <el-form :model="formApps" ref="formApps" label-width="150px">
                    <el-form-item label="路由响应信息" prop="response_msg">
                        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 8}" v-model="formApps.response_msg"></el-input>
                    </el-form-item>
                    <el-form-item label="合成插件脚本" prop="script">
                        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 16}" v-model="formApps.script"></el-input>
                    </el-form-item>
                    <el-form-item label="下发插件命令" prop="request_msg">
                        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 8}" v-model="formApps.request_msg"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div class="form-box tab-cont" style="width:90%;" v-if="isShow=='script'?true:false" v-loading="loading">
                <el-form :model="formScript" ref="formScript" label-width="150px">
                    <el-form-item label="路由响应信息" prop="response_msg">
                        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 8}" v-model="formScript.response_msg"></el-input>
                    </el-form-item>
                    <el-form-item label="下发脚本命令" prop="request_msg">
                        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 8}" v-model="formScript.request_msg"></el-input>
                    </el-form-item>
                </el-form>
            </div>

        </div>


    </div>
</template>

<script>
    import global_ from 'components/common/Global';
    export default {
        data: function(){
            return {
                curId:'',
                curMac:'',
                curRadio:'',
                isShow:'',
                loading:false,
                formApps: {
                    response_msg: '',
                    script:'',
                    request_msg:''
                },
                titArr:['升级ROM详情','升级插件详情','脚本推送详情'],
                titMsg:'',
                formFirmware: {
                    response_msg: '',
                    script:'',
                    request_msg:''
                },
                formScript:{
                    response_msg: '',
                    request_msg:''
                }
            }
        },
        created: function(){
            this.getParams();
        },
        methods: {
            getParams: function(){
                var self = this;
                self.curId = self.$route.query.curid;
                self.curMac = self.$route.query.curmac;
                self.curRadio = self.$route.query.curRadio;
                if(self.curRadio == 'firmware'){
                    self.isShow = 'firmware';
                    self.titMsg = self.titArr[0];
                    self.getFirmwareData();
                }
                if(self.curRadio == 'apps'){//插件升级
                    self.isShow = 'apps';
                    self.titMsg = self.titArr[1];
                    self.getAppsDetailData();
                }
                if(self.curRadio == 'script'){
                    self.isShow = 'script';
                    self.titMsg = self.titArr[2];
                    self.getScriptDetailData();
                }
            },
            getFirmwareData: function(){
                var self = this;
                self.$axios.post(global_.baseUrl+'/task/list/detail',{uuid:self.curId}).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        var data = res.data.extra[0];
                        self.formFirmware.msg = data.pubsub_status=='sysupgrade_ok'?'升级成功':'升级失败';
                        self.formFirmware.response_msg = data.response_msg;
                        self.formFirmware.request_msg = data.request_msg;
                    }else{
                        self.$message.error(res.data.extra)
                    }
                },function(err){
                    self.loading = false;
                    console.log(err);
                });
            },
            getAppsDetailData: function(){
                var self = this;
                var params = {
                    uuid:self.curId,
                    mac:self.curMac
                }
                self.$axios.post(global_.baseUrl+'/manage/apps_detail_detail',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        var data = res.data.extra;
                        self.formApps.response_msg = data.apps_task.response_msg;
                        self.formApps.script = data.script;
                        self.formApps.request_msg = data.apps_task.request_msg;
                    }else{
                        self.$message.error(res.data.extra)
                    }
                },function(err){
                    self.loading = false;
                    console.log(err);
                });
            },
            getScriptDetailData: function(){
                var self = this;
                var params = {
                    uuid:self.curId,
                    mac:self.curMac
                }
                self.$axios.post(global_.baseUrl+'/manage/script_detail_detail',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        var data = res.data.extra[0];
                        self.formScript.response_msg = data.response_msg;
                        self.formScript.request_msg = data.request_msg;
                    }else{
                        self.$message.error(res.data.extra)
                    }
                },function(err){
                    self.loading = false;
                    console.log(err);
                });
            },
        }
    }
</script>
<style>
    .mb40{margin-bottom:40px;}
    .tab-cont{padding:40px;}
</style>
