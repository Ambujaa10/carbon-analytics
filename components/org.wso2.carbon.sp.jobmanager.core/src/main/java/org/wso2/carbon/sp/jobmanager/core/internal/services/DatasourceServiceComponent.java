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
package org.wso2.carbon.sp.jobmanager.core.internal.services;

import com.zaxxer.hikari.HikariDataSource;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.carbon.datasource.core.api.DataSourceService;
import org.wso2.carbon.datasource.core.exception.DataSourceException;
import org.wso2.carbon.sp.jobmanager.core.internal.ManagerDataHolder;

/**
 * This is OSGi-components to register datasource provider class.
 */
@Component(
        name = "org.wso2.carbon.sp.jobmanager.core.internal.services.DatasourceServiceComponent",
        service = DatasourceServiceComponent.class,
        immediate = true
)
public class DatasourceServiceComponent {
    private static final Logger logger = LoggerFactory.getLogger(DatasourceServiceComponent.class);
    private static final String DASHBOARD_DATASOURCE_DEFAULT = "WSO2_STATUS_DASHBOARD_DISTRIBUTED_DB";
    // private static final String METRICS_DATASOURCE_DEFAULT = "WSO2_METRICS_DB";

    @Activate
    protected void start(BundleContext bundleContext) {
        logger.debug("Status dashboard datasource service component is activated.");
    }

    @Deactivate
    protected void stop() {
        logger.debug("Status dashboard datasource service component is deactivated.");
    }


    @Reference(
            name = "org.wso2.carbon.datasource.DataSourceService",
            service = DataSourceService.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unregisterDataSourceService"
    )
    protected void onDataSourceServiceReady(DataSourceService service) throws DataSourceException {
        if (logger.isDebugEnabled()) {
            logger.debug("@Reference(bind) DataSourceService");
        }
        String dashboardDatasourceName = ManagerDataHolder.getInstance().getManagerDeploymentConfig()
                .getDashboardManagerDatasourceName();
        dashboardDatasourceName =
                dashboardDatasourceName != null ? dashboardDatasourceName : DASHBOARD_DATASOURCE_DEFAULT;
        logger.info("datasource name" + dashboardDatasourceName);

        ManagerDataHolder.getInstance().setDashboardManagerDataSource((HikariDataSource) service.getDataSource
                (dashboardDatasourceName));


    }

    protected void unregisterDataSourceService(DataSourceService service) {
        if (logger.isDebugEnabled()) {
            logger.debug("@Reference(unbind) DataSourceService");
        }
        ManagerDataHolder.getInstance().setDashboardManagerDataSource(null);
        // MonitoringDataHolder.getInstance().setMetricsDataSource(null);
    }

    /**
     * Get the ConfigProvider service.
     * This is the bind method that gets called for ConfigProvider service registration that satisfy the policy.
     *
     * @param configProvider the ConfigProvider service that is registered as a service.
     */
    @Reference(
            name = "carbon.config.provider",
            service = ConfigProvider.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unregisterConfigProvider"
    )
    protected void registerConfigProvider(ConfigProvider configProvider) {
        ManagerDataHolder.getInstance().setConfigProvider(configProvider);
        if (logger.isDebugEnabled()) {
            logger.debug("@Reference(bind) ConfigProvider at " + ConfigProvider.class.getName());
        }
    }

    /**
     * This is the unbind method for the above reference that gets called for ConfigProvider instance un-registrations.
     *
     * @param configProvider the ConfigProvider service that get unregistered.
     */
    protected void unregisterConfigProvider(ConfigProvider configProvider) {
        if (logger.isDebugEnabled()) {
            logger.debug("@Reference(unbind) ConfigProvider at " + ConfigProvider.class.getName());
        }
        ManagerDataHolder.getInstance().setConfigProvider(null);
    }
}
