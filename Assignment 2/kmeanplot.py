import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn import cluster as Kcluster, metrics as SK_Metrics
import numpy as np
from scipy.spatial.distance import cdist
from pymongo import MongoClient

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'vis2'
COLLECTION_NAME = 'cancerdata'
FIELDS = {'radius_mean':True,
          'texture_mean':True,
          'perimeter_mean':True,
          'area_mean':True,
          'smoothness_mean':True,
          'compactness_mean':True,
          'concavity_mean':True,
          'concave points_mean':True,
          'symmetry_mean':True,
          'fractal_dimension_mean':True,
           '_id': False}
FIELD = ['radius_mean',
          'texture_mean',
          'perimeter_mean',
          'area_mean',
          'smoothness_mean',
          'compactness_mean',
          'concavity_mean',
          'concave points_mean',
          'symmetry_mean',
          'fractal_dimension_mean'
           ]
def main():

    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    cancerdata = collection.find(projection=FIELDS)
    #cancerdata = collection.find()
    json_cancerdata = []
    for project in cancerdata:
        json_cancerdata.append(project)

    # json_cancerdata = json.dumps(json_cancerdata, default=json_util.default)
    connection.close()
    # converting the input json to a 2d array
    result = []
    for data in json_cancerdata:
        temp =[]
        for test in FIELD:
            temp.append(data[test])

        result.append(temp)

    kMeansVar = [KMeans(n_clusters=k).fit(result) for k in range(1, 10)]
    centroids = [X.cluster_centers_ for X in kMeansVar]
    k_euclid = [cdist(result, cent) for cent in centroids]
    dist = [np.min(ke, axis=1) for ke in k_euclid]
    wcss = [sum(d**2) for d in dist]
    plt.plot(wcss)
    plt.show()

    cluster ={
        "0": list(),
        "1": list(),
        "2": list()
    }
    k_means = Kcluster.KMeans(n_clusters=3).fit(result).labels_
    for i in range(len(k_means)):
        cluster[str(k_means[i])].append(result[i])
    print(len(cluster["0"]))
    print(len(cluster["1"]))
    print(len(cluster["2"]))
# dict(value(kout(i).append(value)))
main()