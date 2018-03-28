<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-star-on"></i> 历史数据</el-breadcrumb-item>
                <el-breadcrumb-item>数据列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box rad-group">
            <el-form :model="form" :rules="rules" ref="form">
                <el-form-item label="K线类型：" prop=stock_ktype :label-width="formLabelWidth">
                    <el-select v-model="form.stock_ktype" class="inp160" placeholder="请选择K线周期">
                        <el-option label="1分钟" value="1"></el-option>
                        <el-option label="5分钟" value="5"></el-option>
                        <el-option label="15分钟" value="15"></el-option>
                        <el-option label="30分钟" value="30"></el-option>
                        <el-option label="60分钟" value="60"></el-option>
                        <el-option label="120分钟" value="120"></el-option>
                        <el-option label="日线" value="day"></el-option>
                        <el-option label="周线" value="week"></el-option>
                        <el-option label="月线" value="month"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="股票名称：" prop="stock_symbol" :label-width="formLabelWidth">
                    <el-input v-model="form.stock_symbol" class="inp160" auto-complete="off" placeholder="请输入股票代码" @change="changeStockSymbol()"></el-input>
                    <span v-text="form.stock_name"></span>
                </el-form-item>
                <el-form-item label="" prop="stock_symbol" :label-width="formLabelWidth">
                    <el-button type="primary" @click="getHistoryListByForm('form')"v-loading.fullscreen.lock="fullscreenLoading">查看数据</el-button>
                </el-form-item>

            </el-form>
        </div>
        <el-table :data="history_list" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column prop="date" label="日期" width="180"></el-table-column>
            <el-table-column prop="code" label="股票代码" width="110"></el-table-column>
            <el-table-column prop="open" label="开盘价" width="110"></el-table-column>
            <el-table-column prop="close" label="收盘价" width="110"></el-table-column>
            <el-table-column prop="high" label="最高价" width="110"></el-table-column>
            <el-table-column prop="low" label="最低价" width="110"></el-table-column>
            <el-table-column prop="volume" label="成交量" width="120"></el-table-column>
        </el-table>
        <div class="pagination">
            <el-pagination
                    @current-change ="handleCurrentChange"
                    :current-page="currentPage"
                    layout="prev, pager, next"
                    :total="pageTotal">
            </el-pagination>
        </div>
    </div>
</template>

<script>
    import global_ from 'components/common/Global';
    export default {
        data: function(){
            return {
                url: './static/datasource.json',
                information: {
                    pagination:{},
                    data:[]
                },

                dialogFormVisible:false,
                radio3:'全部',

                form: {
                    stock_symbol:'000001',
                    stock_ktype:'日线',
                    stock_name:'平安银行',
                    comment:''
                },
                rules: {
                    rom_version:[
                        {required: true, message: '请输入ROM版本号', trigger: 'blur'}
                    ],
                    dev_type:[
                        {required: true, message: '请输入设备类型', trigger: 'blur'},
                    ],
                    ver_type:[
                        {required: true, message: '请输入版本类型', trigger: 'blur'}
                    ],
                    md5_value:[
                        {required: true, message: '请输入MD5串码', trigger: 'blur'}
                    ]
                },
                formLabelWidth: '120px',
                loading:false,
                fullscreenLoading: false,
                history_list:[],

                pageTotal:1,
                current_page:1,
                page_size:10
            }
        },
        created: function(){
            this.getHistoryList(1, this.page_size);
            this.getHistoryListLength();
        },
        methods: {
            getHistoryListLength: function(){//获取task列表
                var self = this;
                var params = {
                    stock_symbol: this.form.stock_symbol,
                    stock_ktype: this.form.stock_ktype,
                };
                self.loading = true;
                self.$axios.post('/api/history/list/length', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.pageTotal = res.data.extra;
                    }
                })
            },
            getHistoryListByForm: function(form){
                this.getHistoryList(1, this.page_size);
                this.getHistoryListLength();
            },
            getHistoryList: function(current_page, page_size){//获取task列表
                var self = this;
                var params = {
                    stock_symbol: this.form.stock_symbol,
                    stock_ktype: this.form.stock_ktype,
                    stock_name: this.form.stock_name,
                    page_size: page_size,
                    current_page: current_page,
                };
                self.loading = true;
                self.$axios.post('/api/history/list', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        //self.pageTotal = res.data.extra.length;
                        self.history_list = res.data.extra.slice(0,10);
                    }
                    else{
                        self.history_list = []
                    }
                })
            },
            changeStockSymbol:function() {

                var stock_symbol = this.form.stock_symbol;

                //获取stock_symbol  对应的名称
                if (stock_symbol.length != 6){
                    this.form.stock_name = '';
                    return;
                }
                var self = this;
                var params = '';
                if (stock_symbol[0] == '6') {
                    params = '/sina/list=' + 'sh' + stock_symbol;
                }else{
                    params = '/sina/list=' + 'sz' + stock_symbol;
                }
                self.$axios.get(params).then(function(res){
                    var data_substr = res.data.match(/\"(\S*)(?=\")/);
                    if (data_substr == null) {
                        return;
                    }
                    var fields = data_substr[1].split(",");
                    self.form.stock_name = fields[0];
                    this.getHistoryList(1, this.page_size);

                },function(err){
                    self.form.stock_name = '';
                    console.log(err);
                })


            },
            handleCurrentChange:function(val){
                this.currentPage = val;
                this.getHistoryList(this.currentPage, this.page_size);
                //this.getHistoryListLength();
            },
        },
        computed:{

        }
    }
</script>

<style src="../../../static/css/datasource.css"></style>
<style>
    .rad-group{margin-bottom:20px;}
    .handle-input{  width: 300px;  display: inline-block;  }
    .handle-box2{display:inline-block;float:right;}
    /*.el-table_1_column_5{color:#eb9e05;}*/
    .orange{color:#eb9e05;background-color:none;}
    .btn2{margin-bottom:5px;margin-left:0;}
    .diainp{width:217px;}
    .diainp2{width:400px;}
    .upload-demo .el-upload {
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    .upload-demo .el-upload:hover {
        border-color: #409EFF;
    }
    .inp180{width:180px;}
    .inp160{width:160px;}
</style>
