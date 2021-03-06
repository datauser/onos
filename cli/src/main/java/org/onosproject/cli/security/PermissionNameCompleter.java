/*
 * Copyright 2015 Open Networking Laboratory
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.onosproject.cli.security;

import org.apache.karaf.shell.console.completer.ArgumentCompleter;
import org.onosproject.cli.AbstractChoicesCompleter;
import org.onosproject.core.Permission;

import java.util.ArrayList;
import java.util.List;

/**
 * Permission Name Completer.
 */
public class PermissionNameCompleter extends AbstractChoicesCompleter {
    @Override
    protected List<String> choices() {
        List<String> permNames = new ArrayList<>();

        ArgumentCompleter.ArgumentList list = getArgumentList();
        String cmd = list.getArguments()[1];
        if (cmd.equals("add") || cmd.equals("remove")) {
            for (Permission perm : Permission.values()) {
                permNames.add(perm.name());
            }
        }
        return permNames;
    }


}
