<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-upload"></i> 系统管理</el-breadcrumb-item>
                <el-breadcrumb-item>系统设置</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class='rad-group mb40' v-if="isShow">
            <el-tabs v-model="tabs_item" type="card" @tab-click="handleClick">
                <el-tab-pane label="交易接口设置" name="1">
                    <div class="form-box tab-cont form-box2">
                        <el-form :model="form_trade" :rules="rule_trade" ref="form_trade" label-width="150px">
                            <el-form-item label="行情接口" prop="market_gateway" :label-width="formLabelWidth">
                                <el-select v-model="form_trade.market_gateway" placeholder="请选择对应行情接口">
                                    <el-option
                                            v-for="item in market_gateway_file_list"
                                            :key="item"
                                            :label="item"
                                            :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="风控名称" prop="riskctrl_name" :label-width="formLabelWidth">
                                <el-select v-model="form_trade.riskctrl_name" placeholder="请选择对应风控">
                                    <el-option
                                            v-for="item in riskctrl_file_list"
                                            :key="item"
                                            :label="item"
                                            :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="交易接口" prop="order_gateway" :label-width="formLabelWidth">
                                <el-select v-model="form_trade.order_gateway" placeholder="请选择对应交易接口">
                                    <el-option
                                            v-for="item in order_gateway_file_list"
                                            :key="item"
                                            :label="item"
                                            :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="setupSubmit('form_trade')" v-loading.fullscreen.lock="fullscreenLoading">确定</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="同步文件到数据库" name="2">
                    <div class="form-box tab-cont form-box2">
                        <el-form :model="form_trade" :rules="rule_trade" label-width="150px">
                            <el-form-item>
                                <el-button type="primary" @click="syncSubmit" v-loading.fullscreen.lock="fullscreenLoading">同步文件到数据库</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
            </el-tabs>

        </div>

    </div>
</template>

<script>
    //import global_ from 'components/common/Global';
    var crypto = require('crypto');
    export default {
        data: function () {
            return {
                user_type:1,  //0:管理员, 1:用户
                isShow:false,
                formLabelWidth: '100px',
                formLabelWidth50: '50px',
                form_trade: {
                    riskctrl_name: '',
                    order_gateway: '',
                    market_gateway: '',
                    bind_market_gateway: '',
                },

                tabs_item: '1',

                typeListData:[],
                ListData:[],
                romListData:[],
                isValidTime0:false,
                upgradeTime:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
                rule_trade: {
                    expired_time: [
                        {required: true, message: '请输入超时时间', trigger: 'blur'},
                        {validator: this.validateTimeNum, trigger: 'blur'}
                    ],
                    operator_name: [
                        {required: true, message: '请输入操作人', trigger: 'blur'},
                        {validator: this.validateSpace, trigger: 'blur'}
                    ]

                },

                riskctrl_file_list:[],
                order_gateway_file_list:[],
                market_gateway_file_list:[],

                fullscreenLoading: false,
            }
        },
        created:function () {
            this.user_type = localStorage.getItem('user_type');  //管理员或用户
            this.isShow = this.user_type =='1'?false:true;
            this.getSystemSetupList();
            this.getRiskCtrlList();
            this.getOrderGatewayList();
            this.getMarketGatewayList();
        },
        methods: {

            getSystemSetupList: function(){//获取task列表
                var self = this;
                self.$axios.post('/api/system/setup/list').then(function(res){
                    if(res.data.ret_code == 0){
                        self.form_trade.order_gateway = res.data.extra.order_gateway;
                        self.form_trade.riskctrl_name = res.data.extra.riskctrl_name;
                        self.form_trade.market_gateway = res.data.extra.market_gateway;
                    }
                });
                console.log('system_setup_list', self.system_setup_list);
            },
            setupSubmit:function (formName) {
                var self = this;
                var params = {
                    updater: {
                        riskctrl_name: self.form_trade.riskctrl_name,
                        order_gateway: self.form_trade.order_gateway,
                        market_gateway: self.form_trade.market_gateway,
                    }
                };
                self.loading = true;
                self.$axios.post('/api/system/setup/update', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message('添加成功');
                    }
                    else {
                        self.$message(res.data.extra);
                    }
                });
            },
            syncSubmit:function () {
                var self = this;
                self.loading = true;
                self.$axios.post('/api/script/sync').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message({message:'同步成功',type:'success'});
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },
            getRiskCtrlList: function(){//获取设备类型
                var self = this;
                var filter = {file_type: 'riskctrl'};
                if (this.user_type == '1'){
                    filter['user_account'] = localStorage.getItem('user_account');
                }
                self.loading = true;
                self.$axios.post('/api/riskctrl/list', {filter: filter}).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.riskctrl_file_list = res.data.extra;
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },
            getOrderGatewayList: function(){//获取设备类型
                var self = this;
                var filter = {file_type: 'order'};
                if (this.user_type == '1'){
                    filter['user_account'] = localStorage.getItem('user_account');
                }
                self.loading = true;
                self.$axios.post('/api/order/list', {filter: filter}).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.order_gateway_file_list = res.data.extra;
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },
            getMarketGatewayList: function(){//获取设备类型
                var self = this;
                var filter = {file_type: 'market'};
                if (this.user_type == '1'){
                    filter['user_account'] = localStorage.getItem('user_account');
                }
                self.loading = true;
                self.$axios.post('/api/market/list', {filter: filter}).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.market_gateway_file_list = res.data.extra;
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },
            handleClick:function (tab,event) {
                var self = this;
                if(tab.name == '1'){
                    self.getRiskCtrlList();
                    self.getOrderGatewayList();
                    self.getMarketGatewayList();
                }
                if(tab.name == '2'){
                    self.getRiskCtrlList();
                    self.getOrderGatewayList();
                    self.getMarketGatewayList();
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
