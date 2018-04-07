<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-star-on"></i> 交易系统管理</el-breadcrumb-item>
                <el-breadcrumb-item>日志列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-table :data="listData" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column prop="create_at" label="创建时间" width="170"></el-table-column>
            <el-table-column prop="log_type" label="日志类型" width="100"></el-table-column>
            <el-table-column prop="log_level" label="日志级别" width="100"></el-table-column>
            <el-table-column prop="comment" label="日志内容"></el-table-column>
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
    var crypto = require('crypto');
    export default {
        data: function(){
            return {
                radio3:'all',
                formLabelWidth: '120px',
                loading:false,
                fullscreenLoading: false,
                listData:[],

                pageTotal:1,
                currentPage:1,
                page_size:10

            }
        },
        created: function(){
            this.getData(1, this.page_size);
            this.getDataLength();
        },
        methods: {
            getDataLength: function(){//获取task列表
                var self = this;
                self.loading = true;
                self.$axios.post('/api/log/list/length').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.pageTotal = res.data.extra;
                    }
                });
            },
            getData: function(current_page, page_size){//获取rom列表
                var self = this;
                var params = {
                    page_size: page_size,
                    current_page: current_page,
                };
                self.loading = true;
                self.$axios.post('/api/log/list', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        if(JSON.stringify(params) == '{}'){
                            self.listData = res.data.extra.slice(0,10);
                        }else{
                            self.listData = res.data.extra;
                        }
                    }
                });
            },
            handleCurrentChange:function(val){
                this.currentPage = val;
                this.getData(this.currentPage, this.page_size);
                //this.getDataLength();
            },
            filterTag:function(value, row) {
                return row.comment === value;
            },
        },
        computed:{

        }
    }
</script>

<style>
    .rad-group{margin-bottom:20px;}
    .handle-input{  width: 300px;  display: inline-block;  }
    .handle-box2{display:inline-block;float:right;}
    .orange{color:#eb9e05;background-color:none;}
    .btn2{margin-bottom:5px;margin-left:0;}
    .diainp{width:217px;}
    .diainp2{width:400px;}
    .upload-demo .el-upload {cursor: pointer;position: relative;overflow: hidden;}
    .upload-demo .el-upload:hover {border-color: #409EFF;}
</style>
